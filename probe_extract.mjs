import JSZip from 'jszip';
import fs from 'fs';

// 1x1 红点 PNG
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

async function buildXlsx(withDrawing, anchorType) {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  zip.file('xl/workbook.xml', `<?xml version="1.0"?><workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>`);
  zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="drawings/drawing1.xml"/></Relationships>`);
  zip.file('xl/worksheets/sheet1.xml', `<?xml version="1.0"?><worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"><xdr:drawing r:id="rId1"/><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>商品</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>商品A</t></is></c></row><row r="3"><c r="A3" t="inlineStr"><is><t>商品B</t></is></c></row></sheetData></worksheet>`);
  zip.file('xl/worksheets/_rels/sheet1.xml.rels', `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`);
  if (withDrawing) {
    let anchor;
    if (anchorType === 'twoCell') {
      anchor = `<xdr:twoCellAnchor><xdr:from><xdr:col>1</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>1</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>2</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>2</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:pic><xdr:blipFill><a:blip r:embed="rId1"/></xdr:blipFill></xdr:pic></xdr:twoCellAnchor>`;
    } else {
      // absoluteAnchor (WPS 浮图常见)
      anchor = `<xdr:absoluteAnchor><xdr:pos x="0" y="0"/><xdr:ext cx="100000" cy="100000"/><xdr:pic><xdr:blipFill><a:blip r:embed="rId1"/></xdr:blipFill></xdr:pic></xdr:absoluteAnchor>`;
    }
    zip.file('xl/drawings/drawing1.xml', `<?xml version="1.0"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${anchor}</xdr:wsDr>`);
    zip.file('xl/drawings/_rels/drawing1.xml.rels', `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/></Relationships>`);
    zip.file('xl/media/image1.png', PNG);
  }
  return zip.generateAsync({ type: 'arraybuffer' });
}

// 复刻 extractXlsxImages 核心逻辑（与 Inventory.tsx 一致）
async function extractXlsxImages(buf, sheetName, dataStartRow, dataRowCount) {
  const out = new Map();
  try {
    const zip = await JSZip.loadAsync(buf);
    const read = async (p) => { const f = zip.file(p); return f ? await f.async('string') : '' };
    const normPath = (base, rel) => {
      const parts = (base.replace(/\/[^/]*$/, '') + '/' + rel).split('/');
      const st = [];
      for (const p of parts) { if (p === '' || p === '.') continue; if (p === '..') st.pop(); else st.push(p); }
      return st.join('/');
    };
    const wb = await read('xl/workbook.xml');
    let sheetRid = '';
    const sheetEls = wb.match(/<sheet\b[^>]*>/g) || [];
    for (const el of sheetEls) { const nm = (el.match(/name="([^"]+)"/) || [])[1]; const rid = (el.match(/r:id="([^"]+)"/) || [])[1]; if (nm === sheetName && rid) { sheetRid = rid; break; } }
    if (!sheetRid) return out;
    const wbRels = await read('xl/_rels/workbook.xml.rels');
    const sheetFile = (wbRels.match(new RegExp(`<Relationship[^>]*Id="${sheetRid}"[^>]*Target="([^"]+)"`)) || [])[1];
    if (!sheetFile) return out;
    const sheetPath = normPath('xl/workbook.xml', sheetFile);
    const sheetXml = await read(sheetPath);
    const drawRid = (sheetXml.match(/<(?:[^:]+:)?drawing[^>]*r:id="([^"]+)"/) || [])[1];
    if (!drawRid) return out;
    const sheetRelsPath = normPath(sheetPath, '_rels/' + sheetPath.replace(/^.*\//, '') + '.rels');
    const sheetRels = await read(sheetRelsPath);
    const drawFile = (sheetRels.match(new RegExp(`<Relationship[^>]*Id="${drawRid}"[^>]*Target="([^"]+)"`)) || [])[1];
    if (!drawFile) return out;
    const drawPath = normPath(sheetPath, drawFile);
    const drawXml = await read(drawPath);
    const drawRelsPath = normPath(drawPath, '_rels/' + drawPath.replace(/^.*\//, '') + '.rels');
    const drawRels = await read(drawRelsPath);
    const anchorRe = /<(?:[^:]+:)?(twoCellAnchor|oneCellAnchor)>([\s\S]*?)<\/(?:[^:]+:)?\1>/g;
    let m;
    while ((m = anchorRe.exec(drawXml))) {
      const body = m[2];
      const rowM = body.match(/<(?:[^:]+:)?from>[\s\S]*?<(?:[^:]+:)?row>(\d+)<\//);
      const blipM = body.match(/r:embed="([^"]+)"/);
      if (!rowM || !blipM) continue;
      const media = (drawRels.match(new RegExp(`<Relationship[^>]*Id="${blipM[1]}"[^>]*Target="([^"]+)"`)) || [])[1];
      if (!media) continue;
      const mediaPath = normPath(drawPath, media);
      const bytes = await zip.file(mediaPath)?.async('uint8array');
      if (!bytes) { console.log('  [锚定] mediaPath 找不到:', mediaPath); continue; }
      out.set(parseInt(rowM[1], 10) + 1, 'data:image/png;base64,' + Buffer.from(bytes).toString('base64').slice(0, 10) + '...');
    }
    // 兜底（放宽：图片数 <= 数据行数 即绑定前 min 个）
    if (out.size === 0) {
      const mediaFiles = Object.keys(zip.files).filter(p => /xl\/media\/.+\.(png|jpe?g|gif|webp|bmp)$/i.test(p)).sort((a,b)=>{const na=parseInt((a.match(/(\d+)/)||[0])[1],10);const nb=parseInt((b.match(/(\d+)/)||[0])[1],10);return na-nb;});
      console.log('  [兜底] mediaFiles 数量 =', mediaFiles.length, ' dataRowCount =', dataRowCount, ' 触发? ', mediaFiles.length > 0 && mediaFiles.length <= dataRowCount);
      if (mediaFiles.length > 0 && mediaFiles.length <= dataRowCount) {
        const n = Math.min(mediaFiles.length, dataRowCount);
        for (let i = 0; i < n; i++) out.set(dataStartRow + i, 'data:image/png;base64,' + Buffer.from(PNG).toString('base64').slice(0,10) + '...');
      }
    }
  } catch (e) { console.log('  [catch]', e.message); }
  return out;
}

(async () => {
  console.log('\n=== 测试1：twoCellAnchor 锚定图（行1→sheet第3行） ===');
  let buf = await buildXlsx(true, 'twoCell');
  let r = await extractXlsxImages(buf, 'Sheet1', 2, 2);
  console.log('  结果 keys:', [...r.keys()], '(期望 [3])');

  console.log('\n=== 测试2：absoluteAnchor 浮图（WPS默认） + 图片数==数据行数 ===');
  buf = await buildXlsx(true, 'absolute');
  r = await extractXlsxImages(buf, 'Sheet1', 2, 2);
  console.log('  结果 keys:', [...r.keys()], '(期望 [2,3] 顺序兜底)');

  console.log('\n=== 测试3：无 drawing，但 zip 里有 media（纯兜底） ===');
  buf = await buildXlsx(false, null);
  // 手工往 zip 注入 media（模拟有图无 drawing 引用的边缘情况）
  const tmp = await JSZip.loadAsync(buf);
  tmp.file('xl/media/image1.png', PNG);
  buf = await tmp.generateAsync({ type: 'arraybuffer' });
  r = await extractXlsxImages(buf, 'Sheet1', 2, 2);
  console.log('  结果 keys:', [...r.keys()], '(期望 [2] 纯兜底触发)');
})();
