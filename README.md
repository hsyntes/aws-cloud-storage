# Node.js AWS Cloud Object Storage Integration

Welcome to the documentation for the Node.js AWS Cloud Object Storage Integration repository. This guide will walk you through the process of seamlessly integrating Amazon Web Services (AWS) Cloud Object Storage, such as AWS S3, with your Node.js applications. By leveraging AWS's powerful and scalable storage solutions, you can efficiently manage your application's data storage needs.

## Introduction

The Node.js AWS Cloud Object Storage Integration repository provides a simple and efficient way to integrate AWS Cloud Object Storage services into your Node.js applications. Whether you're building a web application, a backend service, or any other type of software, this integration allows you to store, retrieve, and manage files effortlessly using AWS's reliable and scalable infrastructure.

## Prerequisites

Before you begin, make sure you have the following prerequisites:

- Node.js
- multer npm package
- Aws Account with Cloud Object Storage (e.g, S3) access

## Installation

To install the Node.js AWS Cloud Object Storage Integration package, run:

`npm install aws-sdk multer`

Optional

`npm install sharp`

## Usage

### Initializing AWS SDK

To start using AWS services, you need to initialize the AWS SDK with your credentials. You can set your credentials using environment variables, AWS configuration files, or directly in your code. Here's an example of initializing the SDK:

```javascript
const AWS = require("aws-sdk");

// AWS Configuration
AWS.config.update({
  accessKeyId: "YOUR_ACCESS_KEY",
  secretAccessKey: "YOUR_SECRET_KEY",
  region: "YOUR_REGION",
});

// Create an S3 instance
const s3 = new AWS.S3();
```

### Uploading Files

```javascript
const params = {
  Bucket: "your-bucket-name", // Folder name in AWS
  Key: "file-name.jpg", // Path
  Body: "File content", // File
};

s3.upload(params, (err, data) => {
  if (err) {
    console.error("Error uploading:", err);
  } else {
    console.log("Upload successful:", data.Location);
  }
});
```

### Uploading Multiple Files

```javascript
const { files } = req;

for (const file of files) {
  const params = {
    Bucket: process.env.AWS_Bucket,
    Key: `users/${req.user.username}/${file.originalname}`,
    Body: file.buffer,
  };

  try {
    const data = await s3.upload(params).promise();
  } catch (err) {
    console.error("Error uploading:", err);
  }
}
```

### Downloading Files

Downloading files from AWS Cloud Object Storage is equally straightforward:

```javascript
const params = {
  Bucket: "your-bucket-name",
  Key: "file-name.jpg",
};

s3.getObject(params, (err, data) => {
  if (err) {
    console.error("Error downloading:", err);
  } else {
    console.log("Downloaded content:", data.Body.toString());
  }
});
```

### Deleting Files

To delete a file:

```javascript
const params = {
  Bucket: "your-bucket-name",
  Key: "file-name.jpg",
};

s3.deleteObject(params, (err, data) => {
  if (err) {
    console.error("Error deleting:", err);
  } else {
    console.log("Deletion successful");
  }
});
```

To delete multiple files

```javascript
const params = {
  Bucket: process.env.AWS_BUCKET,
  Prefix: `posts/${user.username}`,
};

const objects = await s3.listObjectsV2(params).promise();

if (objects?.Contents.length !== 0) {
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET,
    Delete: {
      Objects: objects.Contents.map((object) => ({ Key: object.Key })),
    },
  };

  s3.deleteObjects(deleteParams, (err) => {
    if (err)
      return next(
        new ErrorProvider(403, "fail", "Couldn't delete user's posts.")
      );
  });
}
```

## Security Considerations

When working with AWS Cloud Object Storage, ensure you follow security best practices:

- Use IAM roles and permissions to control access.
- Implement server-side encryption for sensitive data.

## 🔗 Contact

For questions or feedback, reach out to me.

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hsyntes)
