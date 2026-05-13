export enum RequestStatus {
  Success = "success",
  Failure = "failure",
}

type Optional<T> = T | undefined;

export interface Request<T> {
  data: Optional<T>;
  status: RequestStatus;
  error?: string;
}
