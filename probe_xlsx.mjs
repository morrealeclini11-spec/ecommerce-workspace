import JSZip from 'jszip';
import fs from 'fs';

const buf = fs.readFileSync('C:/Users/HFD/Desktop/电商库存表_打印.xlsx');
const zip = await JSZip.loadAsync(buf);

// 列出所有文件
const files = Object.keys(zip.files).sort();
console.log('=== 文件总数:', files.length, '===');
files.forEach(f => { const z = zip.files[f]; if (!z.dir) console.log(' ', f, z._data?.uncompressedSize || '?') });

// 检查 media
const mediaFiles = files.filter(f => /xl\/media\/.+\.(png|jpe?g|gif|webp|bmp|emf|wmf|svg)$/i.test(f));
console.log('\n=== media 图片:', mediaFiles.length, '张 ===');
mediaFiles.forEach(f => console.log(' ', f, zip.files[f]._data?.uncompressedSize || '?'));

// 检查有没有 drawing
const drawFiles = files.filter(f => /xl\/drawing/i.test(f));
console.log('\n=== drawing 文件:', drawFiles.length, '个 ===');
drawFiles.forEach(f => console.log(' ', f));

// 读 drawing 内容
for (const df of drawFiles) {
  if (df.endsWith('.rels') || df.endsWith('.xml')) {
    const content = await zip.file(df).async('string');
    console.log('\n--- ' + df + ' ---');
    console.log(content.slice(0, 2000));
  }
}

// 检查 worksheet 引用
for (const f of files.filter(f => /^xl\/worksheets\/sheet\d+\.xml$/i.test(f))) {
  const xml = await zip.file(f).async('string');
  const hasDrawing = /drawing/i.test(xml);
  console.log('\n' + f + ' has <drawing>:', hasDrawing);
  if (hasDrawing) {
    const m = xml.match(/<xdr:drawing[^>]*>/g);
    if (m) console.log('  drawing element:', m[0]);
  }
}
