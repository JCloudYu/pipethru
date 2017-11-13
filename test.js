(()=>{
	"use strict";
	
	const fs = require( 'fs' );
	const crypto = require( 'crypto' );
	const pipethru = require( './pipethru' );
	
	let pass1, pass2;
	Promise.resolve()
	.then(()=>{
		process.stdout.write( "Calculating digest of verify.js... " );
		return new Promise((fulfill)=>{
			let sha1 = crypto.createHash('sha1');
			let stream = fs.createReadStream('./verify.js', {autoClose:false});
			let buff = [];
			stream.on( 'end', ()=>{
				sha1.update(Buffer.concat(buff));
				pass1 = sha1.digest( 'hex' );
				
				buff = null;
				stream.unpipe();
				stream.removeAllListeners();
				stream.destroy();
				process.stdout.write( `${pass1}\n` );
				fulfill();
			});
			stream.on('data', (chunk)=>{ buff.push(chunk); });
		});
	})
	.then(()=>{
		process.stdout.write( "Calculating digest from samples... " );
		return pipethru([
			'./samples/internal-sample.js',
			'https://cdn.rawgit.com/techfort/LokiJS/master/src/lokijs.js',
			'http://cdn.rawgit.com/techfort/LokiJS/master/src/loki-indexed-adapter.js',
			'https://raw.githubusercontent.com/JCloudYu/fastclick/master/lib/fastclick.js'
		])
		.then((result)=>{
			let sha1 = crypto.createHash('sha1');
			sha1.update(result);
			pass2 = sha1.digest( 'hex' );
			process.stdout.write( `${pass2}\n` );
		})
	})
	.then(()=>{
		console.log( ( pass1 === pass2 ) ? 'passed!' : 'failed!' );
	});
})();
