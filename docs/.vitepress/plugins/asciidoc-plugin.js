const asciidoctor = require('asciidoctor')();
const kroki = require('asciidoctor-kroki');

kroki.register(asciidoctor.Extensions);

module.exports = {
  name: 'vitepress-plugin-asciidoc',
  enforce: 'pre',

  transform(code, id) {
    console.log('asciidocPlugin:', id);
    if (!/\.adoc$/.test(id)) {
      return;
    }

    const html = asciidoctor.convert(code, {
      safe: 'safe',
      attributes: {
        showtitle: true,
      },
    });

    return {
      code: `export default ${JSON.stringify(html)}`,
      map: null,
    };
  },
};
