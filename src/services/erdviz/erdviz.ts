import { safeSqlSplitLine } from "./safeSqlSplitLine";
import { ParseSqlLine } from "./ParseSqlLine";
import { TableNameLibralian } from "./TableNameLibralian";
import { estimateIsForeign } from "./estimateIsForeign";
import { RelationshipStore } from "./RelationshipStore";
import { Cardinality } from "./Cardinality";
import { Relationship } from "./Relationship";
import { RelationshipSyntaxEntity } from "./syntax_entity/RelationSyntaxEntity";

export namespace ErdViz {
  export class Database {
    private tables = new Array<Table>();
    private relationships = new Array<RelationshipSyntaxEntity>();

    public getTables(): Array<Table> {
      return this.tables;
    }

    public pushTable(this: Database, table: Table): void {
      this.tables.push(table);
    }

    public getRelationships(this: Database): Array<RelationshipSyntaxEntity> {
      return this.relationships;
    }

    public pushRelationships(
      this: Database,
      relationship: RelationshipSyntaxEntity
    ): void {
      this.relationships.push(relationship);
    }

    public toDot(): string {
      let result = this.generateHeader(" ");
      this.relationships.forEach(o => {
        result += o.toDot();
      });
      this.tables.forEach(o => {
        result += o.toDot();
      });
      result += "}";
      return result;
    }

    private generateHeader(name: string): string {
      return `
graph {
graph [label=<<FONT POINT-SIZE="20">${name}</FONT>>,
            labeljust = l,
            labelloc = t, nodesep = 0.5,
            ranksep = 0.5,
            pad = "0.2,0.2",
            margin = "0.0",
            cencentrate = true,
            splines = "spline",
            rankdir = LR
                ];
            node[
                label = "\N",
                fontsize = 14,
                margin = "0.07,0.05",
                penwidth = 1.0,
                shape = record
            ];
            edge[
                dir = both,
                fontsize = 12,
                arrowsize = 0.9,
                penwidth = 1.0,
                labelangle = 32,
                labeldistance = 1.8
            ];`;
    }
  }

  export class Table {
    public name: string; //FIXME: Because partial type using
    public fields: Array<Field> = new Array<Field>();

    public constructor(init?: Partial<Table>) {
      Object.assign(this, init);
    }

    public toDot(): string {
      let fieldHtml = "";
      let delimiter = "";
      if (this.fields != null && this.fields.length > 0) {
        fieldHtml =
          '<TABLE BORDER="0" ALIGN="LEFT" CELLPADDING ="0" CELLSPACING ="4" WIDTH ="134" >';
        this.fields.forEach(element => {
          fieldHtml += element.toDot();
        });
        fieldHtml += "</TABLE>";
        delimiter = "|";
      }

      return `\n${this.name} [label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="0.5" WIDTH="134" ALIGN="CENTER">
            <TR>
                <TD ALIGN="CENTER" VALIGN="BOTTOM" WIDTH="134"><FONT POINT-SIZE="14" FACE="Arial bold"><B>${this.name}</B></FONT></TD >
            </TR>
            </TABLE>${delimiter}${fieldHtml}>,fillcolor="#ececfc",style=filled];`;
    }
  }

  export class Field {
    private isNullable?: boolean;
    private isPrimary?: boolean;
    private isForeign?: boolean;
    private length?: number;
    private name?: string;
    private table: Table;
    private type: string;

    public getIsNullable(this: Field): boolean {
      if (this.isNullable === undefined) {
        throw Error("Unexpected property, because uninitialized.");
      }
      return this.isNullable;
    }

    public setIsNullable(this: Field, isNullable: boolean): void {
      this.isNullable = isNullable;
    }

    public setIsPrimary(this: Field, isPrimary: boolean): void {
      this.isPrimary = isPrimary;
    }

    public getIsForeign(this: Field): boolean {
      if (this.isForeign === undefined) {
        throw Error("");
      }
      return this.isForeign;
    }

    public setIsForeign(this: Field, isForeign: boolean): void {
      this.isForeign = isForeign;
    }

    public setLength(this: Field, length: number): void {
      this.length = length;
    }

    public getTable(this: Field): Table {
      return this.table;
    }

    public setTable(this: Field, table: Table): void {
      this.table = table;
    }

    public getName(this: Field): string {
      if (this.name === undefined) {
        throw Error("Unexpected property, because uninitialized.");
      }
      return this.name;
    }

    public setName(this: Field, name: string) {
      this.name = name;
    }

    public setType(this: Field, type: string) {
      this.type = type;
    }

    public toDot(this: Field): string {
      console.log(`${this.name} pk:${this.isPrimary} fk:${this.isForeign}`);
      const name = this.isPrimary ? `<B>${this.name}</B>` : this.name;
      const len: string =
        this.length && this.length > 0 ? `(${this.length})` : "";
      const nullable = !this.getIsNullable() ? " <B>NOT NULL</B>" : "";
      return `\n    <TR><TD ALIGN="LEFT"><FONT POINT-SIZE="12">${name}</FONT>
        <FONT FACE="Arial Italic" POINT-SIZE="10" COLOR="grey60">
          &nbsp;&nbsp;${this.type}${len}${nullable}
        </FONT>
      </TD></TR>`;
    }
  }

  export class SQLInterpreter {
    public static stateIsComment(statement: string): boolean {
      return statement.startsWith("#");
    }

    // TODO: Error dealing
    // Erase field.setLength, field.setType
    public static dataTypeParser(dataType: string): [string, number] {
      // dataType LIKE: VARCHAR(50)
      let length: number = -1;
      if (dataType.indexOf("(") !== -1) {
        const [premitiveDataType, strLength]: string[] = dataType
          .replace(")", "")
          .split("(");
        // Maybe strLength is not a valid number
        try {
          length = parseInt(strLength);
        } catch (e) {
          return [`${premitiveDataType}(${strLength})`, length];
        }
        return [premitiveDataType, length];
        // dataType LIKE: INT
      } else {
        return [dataType, length];
      }
    }
  }

  export class DotGenerator {
    // FIXME: Clean up structure
    public parse(this: DotGenerator, input: string): Database {
      const db = new Database();

      let table: Table | null | undefined;
      const sqlLines: string[] = safeSqlSplitLine(input);
      const tableNameLibralian = TableNameLibralian.getInstance();
      tableNameLibralian.setTableNames(sqlLines);

      const relationshipStore = RelationshipStore.getInstance();
      relationshipStore.setRelationship([]);

      sqlLines.forEach(s => {
        if (s && s.length > 0 && s !== ")") {
          if (s.indexOf("ENGINE") !== -1) {
            return;
          }

          // TODO:
          if (s.indexOf("KEY") !== -1 && s.indexOf("PRIMARY") === -1) {
            return;
          }
          // table
          const tableName = ParseSqlLine.specifyTableName(s);
          if (table && tableName === "") {
            const field = this.getField(s);
            field.getName();
            if (field.getIsForeign()) {
              if (field.getName().replace(/\_id$/, "") !== table.name) {
                const relationshipStore = RelationshipStore.getInstance();
                relationshipStore.pushRelationship({
                  dbRelation: Cardinality.OneToMany,
                  fromTable: field.getName().replace(/\_id$/, ""),
                  toTable: table.name
                });
              }
            }
            table.fields.push(field);
          }
          if (tableName) {
            if (table) {
              db.pushTable(table);
            }
            table = new Table({ name: tableName });
          }
        }
      });
      // tail
      if (table != null) {
        db.pushTable(table);
      }

      relationshipStore.getRelationship().forEach(r => {
        db.pushRelationships(this.parseRelationShip(db, r));
      });

      return db;
    }

    private parseRelationShip(
      db: Database,
      relationship: Relationship
    ): RelationshipSyntaxEntity {
      const r = new RelationshipSyntaxEntity();
      r.setFromField(this.findField(db, relationship.fromTable));
      r.setToField(this.findField(db, relationship.toTable));
      /*
      if (relationStr.indexOf("[") > -1) {
        relationship.setIdentifying(true);
      }*/
      r.setCardinality(Cardinality.OneToMany);
      return r;
    }

    private findField(db: Database, tableName: string): Field {
      const targetTable = db
        .getTables()
        .find(table => table.name === tableName);
      if (!targetTable) {
        throw new Error(`Relationship: Unable to find table '${tableName}'`);
      }

      const targetField = targetTable.fields.find(
        field => field.getName() === tableName + "_id"
      );
      if (!targetField) {
        throw new Error(`Relationship: Unable to find field '${targetField}'`);
      }
      targetField.setTable(targetTable);
      return targetField;
    }

    private getField(this: DotGenerator, input: string): Field {
      const field = new Field();
      const splits: string[] = input.replace(",", "").split(" ");

      // FIEME: Maybe neednot
      if (splits.length === 0) {
        console.error("It seems that needn't");
        field.setName(input);
      }

      if (splits.length > 0) {
        field.setName(splits[0].replace(/\`/g, ""));
      }
      field.setIsForeign(estimateIsForeign(field));
      field.setIsPrimary(input.indexOf("PRIMARY") !== -1);
      if (splits.length > 1) {
        const [dataType, length] = SQLInterpreter.dataTypeParser(splits[1]);
        field.setType(dataType);
        if (length !== -1) {
          field.setLength(length);
        }
      }
      field.setIsNullable(
        !input
          .toUpperCase()
          .replace(",", "")
          .endsWith(" NOT NULL")
      );

      return field;
    }
  }
}
