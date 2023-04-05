import { boxDir } from "./box.ts";

class CommandError extends Error {
  usage: string | null;
  constructor(message: string, usage?: string) {
    super(message);
    this.name = "CommandError";
    this.usage = usage ?? null;
  }
}

class BoxError extends Error {
  hint: string | null;
  constructor(message: string, hint?: string) {
    super(message);
    this.name = "BoxError";
    this.hint = hint ?? null;
  }
}

class BoxCreationError extends BoxError {
  constructor(message: string, hint?: string) {
    super(message, hint);
    this.name = "BoxCreationError";
  }
}

class BoxDuplicateError extends BoxCreationError {
  path: string;
  constructor(name: string, hint?: string) {
    super(`이미 ${name} 상자가 있습니다.`, hint);
    this.name = "BoxDuplicateError";
    this.path = boxDir(name);
  }
}

class ArchiveCreationError extends BoxError {
  constructor(message: string, hint?: string) {
    super(message, hint);
    this.name = "ArchiveCreationError";
  }
}

class LoadArchiveError extends BoxError {
  constructor(message: string, hint?: string) {
    super(message, hint);
    this.name = "LoadArchiveError";
  }
}

export {
  CommandError,
  BoxError,
  BoxCreationError,
  BoxDuplicateError,
  ArchiveCreationError,
  LoadArchiveError,
};
