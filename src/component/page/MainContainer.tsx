import * as React from "react";
import * as d3 from "d3";
import * as d3Graphviz from "d3-graphviz";

import { originalSql, ErdViz } from "../../services/erdviz/index";

// @ts-ignore  Bundle by webpack
const _ = d3Graphviz.graphviz;

interface Props {}

interface State {
  graphviz?: any;
  sqlStatement: string;
}

export class MainContainer extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      graphviz: null,
      sqlStatement: originalSql
    };
  }
  public componentDidMount() {
    const graphviz = d3
      .select("#graph")
      .graphviz()
      // @ts-ignore
      .transition(() => {
        return d3
          .transition("main")
          .ease(d3.easeLinear)
          .delay(0)
          .duration(0);
      });
    graphviz.renderDot(this.interpret(this.state.sqlStatement));
    this.setState({
      graphviz
    });
  }

  private rerenderDiagram = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    if (!event.currentTarget) {
      throw Error("Error target is missing used by updateDiagram");
    }
    this.setState({ sqlStatement: event.currentTarget.value });
    if (this.state.graphviz === null) {
      throw Error("Graphviz is unavailable.");
    }
    this.state.graphviz.renderDot(this.interpret(this.state.sqlStatement));
  };

  private interpret = (input: string): string => {
    try {
      const dotGenerator = new ErdViz.DotGenerator();
      const db = dotGenerator.parse(input);
      return db.toDot();
    } catch (err) {
      //TODO: display;
      console.error("Invalid SQL Syntax", err);
      throw err;
    }
  };

  public render() {
    return (
      <div className="com-p-MainContainer__container">
        <textarea
          className="com-p-MainContainer__textarea"
          value={this.state.sqlStatement}
          onChange={this.rerenderDiagram}
        />
        <div id="graph" className="com-p-MainContainer__graph"></div>
      </div>
    );
  }
}
