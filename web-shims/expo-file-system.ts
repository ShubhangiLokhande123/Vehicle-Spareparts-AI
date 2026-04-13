export const EncodingType = {
  Base64: 'base64',
  UTF8: 'utf8',
};

export const readAsStringAsync = async (
  uri: string,
  options?: { encoding?: string }
): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (options?.encoding === 'base64' || options?.encoding === EncodingType.Base64) {
        resolve(result.split(',')[1] || result);
      } else {
        resolve(result);
      }
    };
    reader.onerror = reject;
    if (options?.encoding === 'base64' || options?.encoding === EncodingType.Base64) {
      reader.readAsDataURL(blob);
    } else {
      reader.readAsText(blob);
    }
  });
};
