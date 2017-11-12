function writeBinaryPostData(req, data, headers) {
    let crlf = "\r\n",
        boundaryKey = Math.random().toString(16),
        boundary = `--${boundaryKey}`,
        delimeter = `${crlf}--${boundary}`,
        closeDelimeter = `${delimeter}--`,
        multipartBody;

    for (let i = 0; i < headers.length; i++) {
        headers[i] += crlf;

    }

    multipartBody = Buffer.concat([
        new Buffer(delimeter + crlf + headers.join('') + crlf),
        data,
        new Buffer(closeDelimeter)]
    );

    req.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
    req.setHeader('Content-Length', multipartBody.length);

    req.write(multipartBody);
    req.end();
}

module.exports = writeBinaryPostData;