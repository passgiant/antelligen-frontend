export type BriefingState =
  | { status: "IDLE" }
  | { status: "LOADING" }
  | { status: "SUCCESS"; content: string }
  | { status: "ERROR"; message: string };
