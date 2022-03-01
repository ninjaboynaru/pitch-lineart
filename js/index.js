const lx = console.log;

const svgContainer = document.getElementsByTagName('svg')[0];


//const gallery = stringArt.gallery(svgContainer, 500, 500, 10);

stringArt.centerQuad(500,500, 100, {delay:1, width:1, color:'#BEBEBE'} ).render(svgContainer, 1);

//lx(renderData);

