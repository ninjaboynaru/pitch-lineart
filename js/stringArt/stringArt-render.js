
const stringArtRender = new function()
{
	const _self = this;
	const _pathShapeGenerator = d3.line().x( (d)=>d.x ).y( (d)=>d.y );

	this.render = function(svgContainer, renderingData, rendersPerPass, onFinishCalllback)
	{
		if(svgContainer == null)
		{
			throw new ReferenceError('null svgContainer element passed to stringArtRender.render()');
			return;
		}

		const container = d3.select(svgContainer);
		const pathShapes = renderingData.paths.map(function(currentPath){
			return _pathShapeGenerator(currentPath.points);
		});

		_internalRender(container, pathShapes, renderingData, rendersPerPass, onFinishCalllback);
	}

	const _internalRender = function(d3SvgContainer, pathShapes, renderingData, rendersPerPass, onFinishCallback, currentPathIndex=0)
	{

		if(currentPathIndex >= pathShapes.length)
		{
			if(typeof onFinishCallback == 'function')
			{
				onFinishCallback();
			}
			return;
		}

		const maxIndexToRender = currentPathIndex + rendersPerPass;
		
		for(; currentPathIndex < maxIndexToRender && currentPathIndex < pathShapes.length; currentPathIndex++)
		{
			const currentPath = renderingData.paths[currentPathIndex];
			const currentPathShape = pathShapes[currentPathIndex];

			d3SvgContainer.append('path')
				.attr('d', currentPathShape)
				.attr('stroke', currentPath.color)
				.attr('stroke-width', currentPath.width)
				.attr('fill', 'none');
		}

		const delay = renderingData.delay;
		setTimeout(function() {
			/** No need to add +1 to currentPathIndex for next iteration. +1 added on last run of above for-loop. */
			_internalRender(d3SvgContainer, pathShapes, renderingData, rendersPerPass, onFinishCallback, currentPathIndex);
		}, delay);
	}





	}
