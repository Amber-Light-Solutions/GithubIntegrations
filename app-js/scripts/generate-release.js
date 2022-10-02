const fs = require('fs');
const { Octokit } = require("@octokit/rest");

var releaseFolder = '../releases/{version}/upgrade-procedure/';
var version = 'latest';
var authorisationFile = '';

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        console.log('Version argument given, will generate release for: ' + val);
        version = val;
    }
	if (index == 3) {
		console.log('Using authorisation token from file: ' + val);
		authorisationFile = val;
	}
});

if (authorisationFile == '' || !fs.existsSync('../' + authorisationFile)) {
	console.log('No valid authorisation token provided. Will not generate release.');
	return;
}

var authorisation = fs.readFileSync('../' + authorisationFile);

console.log('Using authorisation token: ' + authorisation);

releaseFolder = releaseFolder.replace("{version}", version);
var releaseJsonLocation = releaseFolder + 'release.json';

if (!fs.existsSync(releaseFolder)) {
	console.log('No folder "' + releaseFolder + '" exists. Will not generate release.');
	return;
}

if (!fs.existsSync(releaseJsonLocation)) {
	console.log('No release config "' + releaseJsonLocation + '" exists. Will not generate release.');
	return;
}

var mdpdf = require('mdpdf');
var path = require('path');

let rawReleaseJson = fs.readFileSync(releaseJsonLocation);
let releaseJson = null;

try {
	releaseJson = JSON.parse(rawReleaseJson);
} catch (error) {
	console.error(error);
	return;
}

CreateReleaseNotes();

var releaseBody = fs.readFileSync(releaseFolder + 'releasenotes.md');
//console.log(releaseBody.toString());
SendRequest();

async function SendRequest(){
	const octokit = new Octokit({
		auth: authorisation.toString()
	})

	const response = await octokit.request('POST /repos/{owner}/{repo}/releases', {
	owner: releaseJson.data.owner.toString(),
	repo: releaseJson.data.repo.toString(),
	tag_name: version.toString(),
	target_commitish: 'master',
	name: releaseJson.data.product.toString() + ' ' + version.toString(),
	body: releaseBody.toString(),
	draft: false,
	prerelease: false,
	generate_release_notes: false
	})
	console.log(JSON.stringify(response));
}

function CreateReleaseNotes(){
	if (fs.existsSync(releaseFolder + 'releasenotes.md')){
	console.log('Found existing release notes, deleting...');
	fs.unlinkSync(releaseFolder + 'releasenotes.md');
	}
	
	console.log('Creating releasenotes file at "' + releaseFolder + 'releasenotes.md"');
	fs.open(releaseFolder + 'releasenotes.md', 'w', function (err, file) {
	if (err) throw err;
	console.log('Release notes file is opened in write mode.');
	});
	
	AddReleaseNotesHeader();
	
	AddDescriptionOfModificationToRelease();
	
	AddCompatibilityChangeToRelease();
	
	AddInternalConfigurationChangesToRelease();
	
	let upgradeProcess = releaseJson.fields.ManualUpgradeProcess.markdown;
	
	AddFilesToRelease(upgradeProcess);
	
	let rollbackProcess = releaseJson.fields.ManualRollbackProcess.markdown;
	
	AddFilesToRelease(rollbackProcess);
}
function AddReleaseNotesHeader(){
	let data = releaseJson.data;
	if(fs.existsSync(releaseFolder + 'releasenotes.md')){
		fs.writeFileSync(releaseFolder + 'releasenotes.md', '# ' + data.product + ' ' + version.toString() + ' Release Notes'
		+ '\n| New Version | Previous Version | Product |\n| ----------- | ----------- | ----------- |\n| '
		 + version.toString() + ' | ' + data.previous_version + ' | ' + data.product + ' |\n', {
				encoding: "utf8",
				flag: "a+",
				mode: 0o66
			});
	} else {
		console.log('No file "' + releaseFolder + 'releasenotes.md' + '" exists.');
		return;
	}
	
	AddEmptyLineToRelease()
}

function AddInternalConfigurationChangesToRelease(){
	let arrayToAdd = releaseJson.fields.CompatibilityChangeComments;
	if(fs.existsSync(releaseFolder + 'releasenotes.md')){
		fs.writeFileSync(releaseFolder + 'releasenotes.md', '## Internal Configuration Changes\n| Parameter | Value | Comment |\n| ----------- | ----------- | ----------- |\n', {
				encoding: "utf8",
				flag: "a+",
				mode: 0o66
			});
	} else {
		console.log('No file "' + releaseFolder + 'releasenotes.md' + '" exists.');
		return;
	}

	arrayToAdd.forEach(line => {
			fs.writeFileSync(releaseFolder + 'releasenotes.md', '| ' + line[0] + ' | ' + line[1] + ' | ' + line[2] + ' |\n', {
				encoding: "utf8",
				flag: "a+",
				mode: 0o66
			});
		}
	)
	
	AddEmptyLineToRelease()
}

function AddCompatibilityChangeToRelease(){
	let arrayToAdd = releaseJson.fields.CompatibilityChangeComments;
	if(fs.existsSync(releaseFolder + 'releasenotes.md')){
		fs.writeFileSync(releaseFolder + 'releasenotes.md', '## Compatibility Changes\n| Application | Version | Reason | Mandatory |\n| ----------- | ----------- | ----------- | ----------- |\n', {
				encoding: "utf8",
				flag: "a+",
				mode: 0o66
			});
	} else {
		console.log('No file "' + releaseFolder + 'releasenotes.md' + '" exists.');
		return;
	}

	arrayToAdd.forEach(line => {
			fs.writeFileSync(releaseFolder + 'releasenotes.md', '| ' + line[0] + ' | ' + line[1] + ' | ' + line[2] + ' | ' + line[3] + ' |\n', {
				encoding: "utf8",
				flag: "a+",
				mode: 0o66
			});
		}
	)
	
	AddEmptyLineToRelease()
}

function AddDescriptionOfModificationToRelease(){
	let arrayToAdd = releaseJson.fields.DescriptionOfModification;
	if(fs.existsSync(releaseFolder + 'releasenotes.md')){
		fs.writeFileSync(releaseFolder + 'releasenotes.md', '## Description of Modification\n| Issue Ref | Link |\n| ----------- | ----------- |\n', {
				encoding: "utf8",
				flag: "a+",
				mode: 0o66
			});
	} else {
		console.log('No file "' + releaseFolder + 'releasenotes.md' + '" exists.');
		return;
	}

	arrayToAdd.forEach(line => {
			fs.writeFileSync(releaseFolder + 'releasenotes.md', '| ' + line[0] + ' | ' + line[1] + ' |\n', {
				encoding: "utf8",
				flag: "a+",
				mode: 0o66
			});
		}
	)
	
	AddEmptyLineToRelease()
}

function AddFilesToRelease(arrayToAdd){
	arrayToAdd.forEach(file => {
		var fullname = releaseFolder + file;
			if(fs.existsSync(fullname)){
				var data = fs.readFileSync(fullname, 'utf8');
				fs.appendFileSync(releaseFolder + 'releasenotes.md', data);
			} else {
				console.log('No file "' + fullname + '" exists.');
			}
		}
	)
	AddEmptyLineToRelease();
}

function AddEmptyLineToRelease(){
	fs.writeFileSync(releaseFolder + 'releasenotes.md', '\n', {
		encoding: "utf8",
		flag: "a+",
		mode: 0o66
	});
}