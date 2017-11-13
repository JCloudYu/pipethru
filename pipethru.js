#!/usr/bin/env node

(function(){
	"use strict";

	let
	fs		= require( 'fs' ),
	http	= require( 'http' ),
	https	= require( 'https' );
	
	
	let __verbose = false, __stdout = false;
	const exports = module.exports = (paths, env={newline:"\n"})=>{
		let __promise	= Promise.resolve();
		let buffersCache = [];
		paths.forEach((item)=>{
			__promise = __promise.then(()=>{
				__VERBOSE( `Processing \`${item}\`...`, false );
	
	
				return new Promise((fulfill)=>{
					let protocol = item.substr(0, 7).toLowerCase(), netReq = null;
					try {
						switch( protocol ) {
							case "https:/":
								netReq = https;
							case "http://":
								netReq = netReq || http;
								
								netReq.get(item, function(res){
									let proc = (__stdout) ? __READ_TO_STDOUT : __READ_TO_BUFFER;
									proc( res, env.newline )
									.then((result)=>{
										__VERBOSE( ' done', true );
										if ( Buffer.isBuffer(result) ) {
											buffersCache.push(result);
										}
										
										fulfill(result);
									});
								})
								.on( 'error', function( e ){ throw e; });
								break;
							
							default:
								let stream = fs.createReadStream( item, {autoClose:false} );
								let proc = (__stdout) ? __READ_TO_STDOUT : __READ_TO_BUFFER;
									proc( stream, env.newline )
									.then((result)=>{
										__VERBOSE( ' done', true );
										if ( Buffer.isBuffer(result) ) {
											buffersCache.push(result);
										}
										
										fulfill(result);
									});
								break;
						}
					}
					catch( err ) {
						__VERBOSE( ` error` );
						fulfill();
					}
				});
			});
		});
		return __promise.then(()=>{
			return Buffer.concat(buffersCache);
		});
	};
	
	
	
	if ( require.main === module ) {
		let argv = process.argv.slice(2);
		let options = {newline:"\n"};
		__stdout = true;
		
		// Eat env controlling arguments
		let __noMore = false;
		while(argv.length>0 && !__noMore) {
			switch(argv[0]) {
				case "-v":
					__verbose = true;
					break;
					
				case '-crlf':
					options.newline = "\r\n";
					break;
					
				default:
					__noMore = true;
					break;
			}
			
			if ( !__noMore ) {
				argv.shift();
			}
		}
		exports(argv, options);
	}
	
	
	function __VERBOSE(msg, newline=true) {
		if ( !__verbose ) return;
		process.stderr.write( `${msg}${newline ? "\n": ''}` );
	}
	function __READ_TO_BUFFER(iStream, newline) {
		return new Promise((fulfill)=>{
			let buff = [];
			iStream.on( 'data', (chunk)=>{ buff.push(chunk); });
			iStream.on( 'end', ()=>{
				buff.push(Buffer.from(newline, 'utf8'));
				
				iStream.unpipe();
				iStream.removeAllListeners();
				iStream.destroy();
				fulfill(Buffer.concat(buff));
				buff = null;
			});
		});
	}
	function __READ_TO_STDOUT(iStream, newline) {
		return new Promise((fulfill, reject)=>{
			iStream.pipe(process.stdout);
			iStream.on( 'end', function(){
				process.stdout.write( newline );
				
				iStream.unpipe();
				iStream.removeAllListeners();
				iStream.destroy();
				fulfill();
			});
		});
		
	}
})();
