type Result<T> = {
  success: boolean;
  data: T;
  code: number;
  message: string;
};

type PageResult<T> = {
  list: T[];
  current: number;
  total: number;
  pageSize: number;
};

export const OK = <T>(data: T): Result<T> => {
  return {
    success: true,
    data,
    code: 200,
    message: "OK",
  };
};

export const OK_PAGE = <T>(
  data: T[],
  total: number,
  current: number = 1,
  pageSize: number = 10
): PageResult<T> => {
  return {
    list: data,
    total,
    current,
    pageSize,
  };
};
