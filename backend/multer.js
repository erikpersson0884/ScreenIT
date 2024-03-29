import multer from 'multer';

const postStorage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, 'public/img/eventImages/')
	},
	filename: function (req, file, cb) {
		const ogFile = file.originalname.split(".");

	  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + "." + ogFile[ogFile.length-1]
	  cb(null, file.fieldname + '-' + uniqueSuffix)
	}
})

export const uploadPost = multer({ storage: postStorage })
