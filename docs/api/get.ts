export async function getApiReference(projectName: string, pageName: string) {
  const prod = 'https://creaitive.cloud/api/v1/get/api-reference';
  const dev = 'http://localhost:3000/api/v1/get/api-reference';

  const url = `${prod}?projectName=${encodeURIComponent(projectName)}`;

  const findPageByName = (pagesHtml: any, pageName: any) => {
    return pagesHtml.find((page: any) => page.name === pageName);
  };

  return await fetch(url)
    .then(async response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      return findPageByName(Object.values(data.pagesHtml), pageName);
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}
