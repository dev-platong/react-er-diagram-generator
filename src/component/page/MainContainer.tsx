import * as React from "react";
import { ErdViz } from "./erdviz";

import * as d3 from "d3";
import * as d3Graphviz from "d3-graphviz";

const _ = d3Graphviz.graphviz;
console.log(_);

const sqlStatement = `# SAMPLE ERD FILE
# To create a comment start a line with #.

# To create a table copy and paste the SQL
create table AUTHOR (
AUTHOR_ID INT NOT NULL,
NAME VARCHAR(50) NOT NULL,
POSTCODE VARCHAR(50)
)

# Or put the table name in square brackets and the fields like so:

[BOOK]
BOOK_ID INT NOT NULL,
AUTHOR_ID INT NOT NULL,
NAME VARCHAR(50) NOT NULL,

[OWNER]
OWNER_ID INT NOT NULL,
NAME VARCHAR(ABC50) NOT NULL,

[INVENTORY]
INVENTORY_ID INT NOT NULL,
OWNER_ID INT NOT NULL,
BOOK_ID INT NOT NULL
CREATED_DATE_UTC
CREATED_BY

# Relationships are defined by:
# TableName.FieldName [Cardinality] TableName.FieldName
# Cardinality can be:
# 1:* = One to Many
# 1:1 = One to One
# *:* = Many to Many

AUTHOR.AUTHOR_ID [1:*] BOOK.AUTHOR_ID
OWNER.OWNER_ID 1:* INVENTORY.OWNER_ID
BOOK.BOOK_ID 1:* INVENTORY.BOOK_ID`;

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
      sqlStatement
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
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (!event.currentTarget) {
      throw Error("Error target is missing used by updateDiagram");
    }
    console.log(event.currentTarget);
    this.setState({ sqlStatement: event.currentTarget.value });
    try {
      if (this.state.graphviz === null) {
        throw Error("Graphviz is unavailable.");
      }
      this.state.graphviz.renderDot(this.interpret(this.state.sqlStatement));
    } catch (error) {
      alert("Error");
    }
    return undefined;
  };

  private interpret = (input: string): string => {
    try {
      const dotGenerator = new ErdViz.DotGenerator();
      const db = dotGenerator.parse(input);
      return db.toDot();
    } catch (err) {
      //TODO: display;
      console.error("Invalid SQL Syntax");
      throw err;
    }
  };

  public render() {
    return (
      <div>
        <input
          type="text"
          value={this.state.sqlStatement}
          onChange={this.rerenderDiagram}
        ></input>
        <div id="graph"></div>
      </div>
    );
  }
}
