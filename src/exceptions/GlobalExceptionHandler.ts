import {CloudServerException} from "./GlobalException";

export const globalExceptionHandler = async (err: CloudServerException, req: any, res: any, next: any) => {
    console.error('Error ' + err.statusCode + ':  ' + err.message);
    console.error(err.stack);
    res.status(err.statusCode || 500).json({ message: err.message });
};

