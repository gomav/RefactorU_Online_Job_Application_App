var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var multer = require('multer');
var done=false;



var Applicant = require('./models/applicants.js');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// Needed to add the route in order to view the associated pdf.
app.use(express.static(__dirname + '/uploads'));
// Adding path for ViewerJS plugin
app.use('/ViewerJS', express.static('ViewerJS'));
app.use(bodyParser());

// Multer configuration
app.use(multer({ dest: './uploads/', rename: function (fieldname, filename) {
    return filename+Date.now();
	},
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...');
	},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path);
  done=true;
}
}));
// DB cloud connectivty
mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/resumeprojects");

app.post('/api/document', function(req, res){
	if(done==true){
		console.log(req.files);
		res.end("File uploaded");
	}
});

app.get('/', function(req, res) {
	res.render('index');
});


// displays a list of applicants
app.get('/applicants', function(req, res){

	Applicant.find({}, function(err, result){

		res.render('applicants', {
			applicants: result
		});
	});

});

// creates a new applicant
app.post('/applicant', function(req, res){
  console.log(req.body, req.files);
	var	bodyData = req.body;
	bodyData.skills = bodyData.skills.split(',');
  bodyData.documentPath= req.files.userDocument.name;
	var newApplicant = new Applicant(bodyData);

	newApplicant.save(function(err, result){
		res.redirect('/success');
	});


// Here is where you need to get the data
// from the post body and store it in the database

});
app.get('/success', function(req, res){
	res.render('success');
});

app.get('/delete/:applicantID', function(req, res){
	var applicantID = req.params.applicantID;

	Applicant.remove({_id : applicantID}, function(err, result){
		res.redirect('/applicants');
	});
});

app.get('/:applicantID', function(req, res){
	var user = req.params.applicantID;
	console.log(user);
	Applicant.find({_id : user}, function(err, result){
		var currentUser = result;
		console.log(currentUser);
		res.render('applicantInfo', {
			userObject : currentUser
		});
	});
});

var port = process.env.PORT || 8441;
var server = app.listen(port, function() {
	console.log('Express server listening on port ' + server.address().port);
});
