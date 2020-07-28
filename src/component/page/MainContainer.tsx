import * as React from "react";
import * as d3 from "d3";
import * as d3Graphviz from "d3-graphviz";

import { originalSql, ErdViz } from "../../services/erdviz/index";

// @ts-ignore  Bundle by webpack
const _ = d3Graphviz.graphviz;

export const MainContainer: React.FC = () => {
  const [graphviz, setGraphviz] = React.useState<any>(null);
  const [sqlStatement, setSQLStatement] = React.useState(originalSql);
  const dotGeneratorRef = React.useRef<ErdViz.DotGenerator>();
  React.useEffect(() => {
    dotGeneratorRef.current = new ErdViz.DotGenerator();
  }, []);

  const interpret = (inputSQL: string): string => {
    if (dotGeneratorRef.current === undefined) {
      throw new Error("Fatal: Ref container has something bugs.");
    }
    try {
      const db = dotGeneratorRef.current.parse(inputSQL);
      return db.toDot();
    } catch (err) {
      //TODO: display;
      console.error("Invalid SQL Syntax", err);
      throw err;
    }
  };

  React.useEffect(() => {
    const graphviz = d3
      .select("#graph")
      .graphviz()
      // @ts-ignore
      .transition(() => {
        return d3.transition("main").ease(d3.easeLinear).delay(0).duration(0);
      });
    graphviz.renderDot(interpret(sqlStatement));
    setGraphviz(graphviz);
  }, []);

  const rerenderDiagram = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    if (!event.currentTarget) {
      throw Error("Error target is missing used by updateDiagram");
    }
    setSQLStatement(event.currentTarget.value);
    if (graphviz === null) {
      throw Error("Graphviz is unavailable.");
    }
    graphviz.renderDot(interpret(sqlStatement));
  };

  return (
    <div className="com-p-MainContainer__container">
      <textarea
        className="com-p-MainContainer__textarea"
        value={sqlStatement}
        onChange={rerenderDiagram}
      />
      <div id="graph" className="com-p-MainContainer__graph" />
    </div>
  );
};
