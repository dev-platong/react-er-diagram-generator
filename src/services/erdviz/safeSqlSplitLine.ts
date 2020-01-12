import { ErdViz } from "./index";

/* コーディング上で、不必要な`を削除します。 */
export function safeSqlSplitLine(sqlBody: string): string[] {
  const rawLines: string[] = sqlBody.split("\n");
  const safeLines = rawLines
    .map(s => {
      return s.trim();
    })
    .map(s => {
      return s.toLowerCase();
    })
    .map(s => {
      return s.replace(/\`/g, "");
    })
    .filter(s => !ErdViz.SQLInterpreter.stateIsComment(s));
  return safeLines;
}
