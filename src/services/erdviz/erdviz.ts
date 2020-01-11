export namespace ErdViz {
  export class Database {
    private tables: Array<Table> = new Array<Table>();
    private relationships: Array<Relationship> = new Array<Relationship>();

    public getTables(): Array<Table> {
      return this.tables;
    }

    public pushTable(this: Database, table: Table): void {
      this.tables.push(table);
    }

    public getRelationships(this: Database): Array<Relationship> {
      return this.relationships;
    }

    public pushRelationships(this: Database, relationship: Relationship): void {
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
    private length?: number;
    private name?: string;
    private primaryKey: boolean;
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
      const name = this.primaryKey ? `<B>${this.name}</B>` : this.name;
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

  export enum Cardinality {
    OneToOne,
    OneToMany,
    ManyToMany
  }

  export class Relationship {
    private cardinality?: Cardinality;
    private fromField?: Field;
    private identifying: boolean;
    private label: string;
    private toField?: Field;

    public setCardinality(this: Relationship, cardinality: Cardinality) {
      this.cardinality = cardinality;
    }

    public setFromField(this: Relationship, fromField: Field) {
      this.fromField = fromField;
    }

    public setIdentifying(this: Relationship, identifying: boolean) {
      this.identifying = identifying;
    }

    public setToField(this: Relationship, toField: Field) {
      this.toField = toField;
    }

    public toDot(): string {
      if (!this.toField || !this.fromField) {
        throw Error("To Field or toFrom or both is not declared.");
      }
      const label = this.label ? `\nlable=<<FONT>${this.label}</FONT>>` : "";
      const style = this.identifying ? "solid" : "dotted";
      let cardStr = "";
      switch (this.cardinality) {
        case Cardinality.OneToOne:
          cardStr = `[arrowhead=noneotee,headlabel=<<FONT>1</FONT>>,${label}style=${style},arrowtail=noneotee,taillabel=<<FONT>1</FONT>>]`;
          break;
        case Cardinality.OneToMany:
          cardStr = `[arrowhead=noneotee,headlabel=<<FONT>1</FONT>>,${label}style=${style},arrowtail=ocrow,taillabel=<<FONT>0..N</FONT>>]`;
          break;
        case Cardinality.ManyToMany:
          cardStr = `[arrowhead=ocrow,headlabel=<<FONT>0..N</FONT>>,${label}style=${style},arrowtail=ocrow,taillabel=<<FONT>1..1</FONT>>]`;
          break;
      }
      return `\n${this.toField.getTable().name} -- ${
        this.fromField.getTable().name
      } ${cardStr} ;`;
    }
  }

  class SQLInterpreter {
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
      const relationshipText = new Array<string>();

      let table: Table | null | undefined;
      input
        .split("\n")
        .map(s => {
          return s.trim();
        })
        .forEach(s => {
          if (
            s &&
            !SQLInterpreter.stateIsComment(s) &&
            s.length > 0 &&
            s !== ")"
          ) {
            if (s.indexOf("ENGINE") !== -1) {
              return;
            }

            // TODO:
            if (s.indexOf("KEY") !== -1) {
              return;
            }
            // relationship TODO: !=
            if (s.indexOf("-:+") > -1) {
              relationshipText.push(s);
            } else {
              // table
              const tableName = this.determineTable(s);
              if (table && !tableName) {
                table.fields.push(this.getField(s));
              }
              if (tableName) {
                if (table) {
                  db.pushTable(table);
                }
                table = new Table({ name: tableName });
              }
            }
          }
        });
      // tail
      if (table != null) {
        db.pushTable(table);
      }

      console.log(relationshipText);
      relationshipText.forEach(s => {
        db.pushRelationships(this.parseRelationShip(db, s));
      });

      return db;
    }

    private parseRelationShip(db: Database, s: string): Relationship {
      const relationStatements = s.split(" ");
      if (relationStatements.length < 3) {
        throw Error("Relationship statement format is invalid.");
      }

      const relationship = new Relationship();
      const [from, relationStr, to] = relationStatements;
      relationship.setFromField(this.findField(db, from));
      relationship.setToField(this.findField(db, to));
      if (relationStr.indexOf("[") > -1) {
        relationship.setIdentifying(true);
      }
      const cardinality = relationStr.replace("[", "").replace("]", "");
      switch (cardinality) {
        case "1-:+1":
          relationship.setCardinality(Cardinality.OneToOne);
          break;
        case "1-:+*":
          relationship.setCardinality(Cardinality.OneToMany);
          break;
        case "*-:+*":
          relationship.setCardinality(Cardinality.ManyToMany);
          break;
        default:
          throw new Error(
            `Unknown Cardinality: '${cardinality}' (Options are 1-:+1, 1-:+*, *-:+*)`
          );
      }
      return relationship;
    }

    private findField(db: Database, s: string): Field {
      const splits = s.split(".");
      if (splits.length !== 2) {
        throw new Error(`Error around '${s}'`);
      }
      let targetTable: Table | undefined;
      let targetField: Field | undefined;
      db.getTables().forEach(table => {
        if (table.name.toUpperCase() === splits[0].toUpperCase()) {
          targetTable = table;
        }
      });
      if (targetTable === undefined) {
        throw new Error(`Relationship: Unable to find table '${s}'`);
      }

      // FIXME: 構造全体がおかしいから型推論が死んでる
      targetTable.fields.forEach(field => {
        if (field.getName().toUpperCase() === splits[1].toUpperCase()) {
          targetField = field;
          field.setTable(targetTable as Table);
        }
      });
      if (!targetField) {
        throw new Error(`Relationship: Unable to find field '${s}'`);
      }
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

    private determineTable(input: string): string | null {
      if (
        input.indexOf("create table ") > -1 ||
        input.indexOf("CREATE TABLE ") > -1
      ) {
        const splits = input.split(" ");
        if (splits.length > 2) {
          const a = splits[2].replace(/\`/g, "");
          console.log(a);
          return a;
        }
      }

      if (input.startsWith("[") && input.endsWith("]") && input.length > 2) {
        return input.substring(1, input.length - 1);
      }
      return null;
    }
  }
}
