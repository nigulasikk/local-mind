/**  从文件路径中 截取文件名 */
function getFileName(path: string): string {
    const parts = path.split("/");
    return parts.pop() || '';
  }

  export {
    getFileName
  }