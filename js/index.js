const svgContainer = document.getElementsByTagName('svg')[0];


const centerQuad = stringArt.centerQuad(500,500, 100, {delay:1, width:1, color:'#BEBEBE'} );

// DANGER: Possible stack overflow
function renderCenterQuad() {
    d3.select(svgContainer).selectAll('*').remove();
    centerQuad.render(svgContainer, 0.5, renderCenterQuad);
}

document.addEventListener('DOMContentLoaded', renderCenterQuad);
