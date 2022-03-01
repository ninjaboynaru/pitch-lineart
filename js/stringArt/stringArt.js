
/**
* @typedef renderingData
* {
*	delay: int,
*	xOrigin: int,
*	yOrigin: int,
*	paths: [ {pathData} ]
* }
*/


/**
* @typedef pathData
* {
*	color: string,
*	width: int,
*	points: [point - only 2]
* }
*/

/**
* @typedef point
* {
*	x: int,
*	y: int,
* }
*/





const stringArt = new function()
{
	const _self = this;

	this.types = (function(){
		const objectTypes = {};

		objectTypes.renderingData = function renderingData(delay, paths)
		{
			this.delay = delay;
			this.paths = paths || [];
		}
		objectTypes.renderingData.prototype.append = function(renderData)
		{
			this.paths = this.paths.concat(renderData.paths);
			return this;
		}
		objectTypes.renderingData.prototype.render = function(svgContainer, rendersPerPass, onFinishCallback)
		{
			stringArtRender.render(svgContainer, this, rendersPerPass, onFinishCallback);
			return this;
		}
		objectTypes.renderingData.prototype.reflect = function(xOrigin, yOrigin)
		{
			this.paths.forEach(function(currentPath){
				currentPath.points.forEach(function(currentPoint){
					currentPoint = _self.utils.reflectOnAxis(currentPoint, xOrigin, yOrigin);
				});
			});

			return this;
		}


		objectTypes.renderingGroup = function renderingGroup(renderingObjects)
		{
			this.renderGroup = renderingObjects;
		}
		objectTypes.renderingGroup.prototype.add = function add(renderingData)
		{
			this.renderGroup.push(renderingData);
		}
		objectTypes.renderingGroup.prototype.render = function render(svgContainer, rendersPerPass, onFinishCallback)
		{
			const totalRenders = this.renderGroup.length;
			let rendersFinished = 0;

			this.renderGroup.forEach(function(currentRenderData){
				currentRenderData.render(svgContainer, rendersPerPass, onRenderDone);
			});

			function onRenderDone()
			{
				rendersFinished += 1;
				if(rendersFinished >= totalRenders)
				{
					onFinishCallback();
				}
			}
		}


		objectTypes.pathData = function pathData(startPoint, endPoint, width, color)
		{
			this.points = [startPoint, endPoint];
			this.width = width;
			this.color = color;
		}
		objectTypes.point = function point(x,y)
		{
			this.x = x;
			this.y = y;
		}

		return objectTypes;
	}());

	this.utils = (function(){
		const utilityFunctions = {};

		utilityFunctions.randomBool = function()
		{
			return Math.random() >= 0.5;
		}
		utilityFunctions.randomInt = function randomInt(min,max, allowFloat)
		{
			let randomValue = (Math.random()*(max-min+1)+min);
			if(allowFloat === true)
			{
				return randomValue;
			}
			else
			{
				return Math.floor(randomValue);
			}
		}

		utilityFunctions.randomRgbString = function randomRgbString()
		{
			const red = utilityFunctions.randomInt(0, 255);
			const green = utilityFunctions.randomInt(0, 255);
			const blue = utilityFunctions.randomInt(0, 255);

			return `rgb(${red}, ${green}, ${blue})`;
		}

		utilityFunctions.percentOf = function (percent, value)
		{
			return (percent/100) * value;
		}

		utilityFunctions.toRadians = function toRadians(degrees)
		{
			return (Math.PI/180) * degrees;
		}
		utilityFunctions.toDegrees = function toDegrees(radians)
		{
			return (180/Math.PI) * radians;
		}
		utilityFunctions.pointOnCircle = function pointOnCricle(radius, angle, xOrigin, yOrigin)
		{
			const angleInRadians = utilityFunctions.toRadians(angle);
			const point = new _self.types.point();

			point.x = (Math.cos(angleInRadians) * radius) + xOrigin;
			point.y = (Math.sin(angleInRadians) * radius) + yOrigin;

			return point;
		}
		utilityFunctions.reflectOnAxis = function reflectOnAxis(point, xOrigin, yOrigin)
		{
			// reflect across y axis
			if(xOrigin)
			{
				const xDistanceFromOrigin = xOrigin - point.x;
				point.x = xOrigin + xDistanceFromOrigin;
			}

			// reflect across x axis
			if(yOrigin)
			{
				const yDistanceFromOrigin = yOrigin - point.y;
				point.y = yOrigin + yDistanceFromOrigin;
			}

			return point;
		}
		utilityFunctions.deleteElementChildren = function(element)
		{
			while(element.firstChild)
			{
				element.removeChild(element.firstChild);
			}
		}

		return utilityFunctions;
	}());

	const _defaultOptions = {
		delay:0,
		width:1,
		color:'red',
		reflectX:false,
		reflectY:false
	}
	const _mergeDefaultOptions = function(userOptions)
	{
		return Object.assign({}, _defaultOptions, userOptions);
	}

	this.triangleFlaps = function(xStep, yStep, xCount, yCount, options)
	{
		const iOptions = _mergeDefaultOptions(options);
		const paths = [];

		const renderingWidth = xCount * xStep;
		const renderingHeight = yCount * yStep;
		const centerPoint = new _self.types.point(renderingWidth/2, renderingHeight/2);

		for(let x = 1; x <= xCount; x++)
		{
			const color = _self.utils.randomRgbString();
			for(let y = 1; y <= yCount; y++)
			{
				let startPoint = new _self.types.point(x*xStep, 0);
				let endPoint = new _self.types.point(0, y*yStep);

				if(iOptions.reflectX === true)
				{
					startPoint = _self.utils.reflectOnAxis(startPoint, null, centerPoint.y);
					endPoint = _self.utils.reflectOnAxis(endPoint, null, centerPoint.y);
				}
				if(iOptions.reflectY === true)
				{
					startPoint = _self.utils.reflectOnAxis(startPoint, centerPoint.x, null);
					endPoint = _self.utils.reflectOnAxis(endPoint, centerPoint.x, null);
				}
				const pathData = new _self.types.pathData(startPoint, endPoint, iOptions.width, iOptions.color);

				paths.push(pathData);
			}
		}

		return new _self.types.renderingData(iOptions.delay, paths)
	}


	this.quad = function(xStep, yStep, pointCount, options)
	{
		const iOptions = _mergeDefaultOptions(options);
		const paths = [];

		const quadWidth = pointCount * xStep;
		const quadHeight = pointCount * yStep;
		const centerPoint = new _self.types.point(quadWidth/2, quadHeight/2);

		for(let i = 0; i < pointCount; i++)
		{
			let startPoint = new _self.types.point( (pointCount-i) * xStep, 0);
			let endPoint = new _self.types.point(0, (i+1) * yStep);

			if(iOptions.reflectX === true)
			{
				startPoint = _self.utils.reflectOnAxis(startPoint, null, centerPoint.y);
				endPoint = _self.utils.reflectOnAxis(endPoint, null, centerPoint.y);
			}
			if(iOptions.reflectY === true)
			{
				startPoint = _self.utils.reflectOnAxis(startPoint, centerPoint.x, null);
				endPoint = _self.utils.reflectOnAxis(endPoint, centerPoint.x, null);
			}

			const pathData = new _self.types.pathData(startPoint, endPoint, iOptions.width,iOptions.color);
			paths.push(pathData);
		}

		return new _self.types.renderingData(iOptions.delay, paths);
	}

	this.centerQuad = function(canvasXSize, canvasYSize, pointCount, options)
	{
		const iOptions = _mergeDefaultOptions(options);

		const canvasCenterPoint = new _self.types.point(canvasXSize/2, canvasYSize/2);
		const quadCenterPoint = new _self.types.point(canvasCenterPoint.x/2, canvasCenterPoint.y/2);

		const quadWidth = canvasXSize/2;
		const quadHeight = canvasYSize/2;

		const xStep = quadWidth/pointCount;
		const yStep = quadHeight/pointCount;

		const quadOptions = Object.assign({}, iOptions, {reflectX:true, reflectY:true} );
		const quadA = _self.quad(xStep, yStep, pointCount, quadOptions);
		const quadB = _self.quad(xStep, yStep, pointCount, quadOptions);
		const quadC = _self.quad(xStep, yStep, pointCount, quadOptions);
		const quadD = _self.quad(xStep, yStep, pointCount, quadOptions);

		quadB.reflect(canvasCenterPoint.x, null);
		quadC.reflect(null, canvasCenterPoint.y);
		quadD.reflect(canvasCenterPoint.x, canvasCenterPoint.y);

		return new _self.types.renderingGroup([quadA, quadB, quadC, quadD]);
	}

	this.circle = function(radius, step, xOrigin, yOrigin, options)
	{
		const iOptions = _mergeDefaultOptions(options);

		if(step > 360 || step < 0)
		{
			step = 4;
		}

		const paths = [];
		const points = [];

		for(let angle = 0; angle < 360; angle++)
		{
			points.push(_self.utils.pointOnCricle(radius, angle, xOrigin, yOrigin) );
		}

		for(let i = 0; i < points.length; i++)
		{
			let endPointIndex = i + step;
			if(endPointIndex >= points.length)
			{
				endPointIndex = endPointIndex - points.length; 
			}

			const startPoint = points[i];
			const endPoint = points[endPointIndex];

			const color = _self.utils.randomRgbString();
			const pathData = new _self.types.pathData(startPoint, endPoint, iOptions.width, iOptions.color);

			paths.push(pathData);
		}

		return new _self.types.renderingData(delay, paths);					
	}


	this.gallery = function(svgContainer, svgUserSizeX, svgUserSizeY, rendersBeforeClear)
	{
		let stopGallery = false;
		const possibleRenderings = ['QUAD', 'QUAD', 'CENTER-QUAD', 'CIRCLE'];
		let renderedCount = 0;

		function randomOptions()
		{
			return {
				width: _self.utils.randomInt(1, 3),
				delay: _self.utils.randomInt(50, 60, true),
				color: _self.utils.randomRgbString(),
				reflectX: _self.utils.randomBool(),
				reflectY: _self.utils.randomBool()
			}
		}

		function newRender()
		{
			const renderingFunction = possibleRenderings[_self.utils.randomInt(0, 2)];
			const svgSize = {x:svgUserSizeX, y:svgUserSizeY};

			const options = randomOptions();
			const rendersPerPass = _self.utils.randomInt(1,3);
			const maxPointCount = 60;

			switch(renderingFunction)
			{
				case 'FLAPS': {
					const xCount = _self.utils.randomInt(15, maxPointCount/4);
					const yCount = _self.utils.randomInt(15, maxPointCount/4);

					const xStep = svgSize.x/xCount;
					const yStep = svgSize.y/yCount;

					_self.triangleFlaps(xStep, yStep, xCount, yCount, options).render(svgContainer, rendersPerPass, onRenderFinish);
					break;
				}
				case 'QUAD': {
					const pointCount = _self.utils.randomInt(15, maxPointCount);
					const xStep = svgSize.x/pointCount;
					const yStep = svgSize.y/pointCount;

					_self.quad(xStep, yStep, pointCount, options).render(svgContainer, rendersPerPass, onRenderFinish);
					break;
				}
				case 'CENTER-QUAD': {
					const pointCount = _self.utils.randomInt(15, maxPointCount);

					_self.centerQuad(svgSize.x, svgSize.y, pointCount, options).render(svgContainer, rendersPerPass, onRenderFinish);
					break;
				}
			}
		}

		function onRenderFinish()
		{
			if(renderedCount >= rendersBeforeClear-1 || rendersBeforeClear == null)
			{
				_self.utils.deleteElementChildren(svgContainer);
				renderedCount = 0;
			}
			else
			{
				renderedCount += 1;
			}
			
			if(stopGallery == false)
			{
				newRender();
			}
		}

		function stop()
		{
			stopGallery = true;
		}

		newRender();
		return {stop:stop}
	}
}









