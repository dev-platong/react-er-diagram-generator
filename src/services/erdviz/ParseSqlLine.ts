export namespace ParseSqlLine {
  export function specifyTableName(sqlLine: string): string {
    if (
      sqlLine.startsWith("[") &&
      sqlLine.endsWith("]") &&
      sqlLine.length >= 3
    ) {
      return sqlLine.substring(1, sqlLine.length - 1);
    } else if (
      sqlLine.indexOf("create ") !== -1 &&
      sqlLine.split(" ").length >= 3
    ) {
      return sqlLine.split(" ")[2];
    } else {
      return "";
    }
  }
}
