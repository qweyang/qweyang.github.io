const getPixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;

const ctx = document.querySelector('.js-canvas').getContext('2d');
const ctxGhost = document.createElement('canvas').getContext('2d');

const imageUrl = '1.jpg';

let imageData;
let painters;

const loadImage = () => {
	const img = new Image();
	img.crossOrigin = '';

	return new Promise(function(resolve, reject) {
		img.addEventListener('load', () => {
			resolve(img);
		});

		img.src = imageUrl;
	});
};

const setupCanvas = (width, height) => {
	ctxGhost.canvas.width = width;
	ctxGhost.canvas.height = height;

	ctx.canvas.width = width;
	ctx.canvas.height = height;
};

const getImageData = (ctxDest, image) => {
	ctxDest.drawImage(image, 0, 0);

	const imageData  = ctxDest.getImageData(0, 0, ctxDest.canvas.width, ctxDest.canvas.height);

	return imageData;
};

const getColorFromPosition = ({ x, y }, imageData) => {
	const pixelIndex = getPixelIndex(x, y, imageData);

	return {
		r: imageData.data[pixelIndex],
		g: imageData.data[pixelIndex + 1],
		b: imageData.data[pixelIndex + 2],
	};
};

const checkReset = (painter, width, height) => {
	const { position: { x, y, } } = painter;

	if (x < 0 || x > width || y < 0 || y > height) {
		const def = getDefaultPainter(width, height );

		painter.position = { ...def.position };
		painter.angle = def.angle;
		painter.radius = def.radius;
		painter.speed = def.speed;
		painter.color = getColorFromPosition(def.position, imageData);
	}
};

const drawSegment = (painter, ctxDest) => {
	const { position, color, radius } = painter;

	ctxDest.beginPath();
	ctxDest.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
	ctxDest.arc(position.x, position.y, radius, 0, Math.PI * 2);
	ctxDest.fill();
	ctxDest.closePath();
};

const draw = () => {
	const { width, height } = ctx.canvas;
	const smoothness = 5;

	painters.forEach((painter) => {
		painter.position.x += Math.cos(painter.angle) * painter.speed;
		painter.position.y += Math.sin(painter.angle) * painter.speed;

		const color = getColorFromPosition(painter.position, imageData);

		painter.color.r += (color.r - painter.color.r) / smoothness;
		painter.color.g += (color.g - painter.color.g) / smoothness;
		painter.color.b += (color.b - painter.color.b) / smoothness;

		const total = color.r + color.g + color.b;
		const percent = 1- (total / (255 * 3));

		painter.radius = 1 + (3 * percent);

		drawSegment(painter, ctx);

		checkReset(painter, width, height);
	});

	requestAnimationFrame(draw);
};

const getDefaultPainter = (width, height) => {
	return {
		angle: (Math.PI * 2) * Math.random(),
		speed: 4 + Math.random(),
		position: {
			x: width * Math.random(),
			y: height * Math.random(),
		},
		color: {
			r: 255,
			g: 255,
			b: 255,
		},
		radius: 2,
	};
};

const start = async () => {
	const image = await loadImage();

	const { width, height } = image;
	const numPainters = 300;

	setupCanvas(width, height);

	imageData = getImageData(ctxGhost, image);

	painters = new Array(numPainters).fill().map((_, i) => ({
		...getDefaultPainter(width, height),
	}));

	ctx.canvas.addEventListener('click', () => {
		ctx.clearRect(0, 0, width, height);
	});

	draw();
};

start();
