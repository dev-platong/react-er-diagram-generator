import { ParseSqlLine } from "./ParseSqlLine";

export class TableNameLibralian {
  private tableNames: string[] = [];
  private static instance = new TableNameLibralian();
  private constructor() {}

  public setTableNames(this: TableNameLibralian, sqlLines: string[]): void {
    this.tableNames = sqlLines
      .map(s => {
        return ParseSqlLine.specifyTableName(s);
      })
      .filter(s => s !== "");
  }
  public static getInstance(): TableNameLibralian {
    return TableNameLibralian.instance;
  }
  public isInclude(tableName: string): boolean {
    return this.tableNames.includes(tableName);
  }
}
