import { checkMissedVariables } from '../../utils/checkMissedVariables';
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const awsEndpoint = process.env.AWS_ENDPOINT;

const missingKey = checkMissedVariables({
  AWS_S3_BUCKET_NAME,
  accessKeyId,
  secretAccessKey,
  awsEndpoint,
});

if (missingKey) {
  throw new Error(`Config key ${missingKey} is missing.`);
}

AWS.config.update({
  accessKeyId,
  secretAccessKey,
});

export const fileInterceptorSettings = {
  storage: multerS3({
    s3: new AWS.S3({
      endpoint: new AWS.Endpoint(awsEndpoint),
      s3ForcePathStyle: true,
    }),
    bucket: AWS_S3_BUCKET_NAME,
    acl: 'public-read',
    key: (req: any, file, cb) => {
      cb(null, `${req.user.id}/${uuidv4()}-${file.originalname}`);
    },
  }),
};
