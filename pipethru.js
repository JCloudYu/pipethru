(function(){
	"use strict";

	var loadTrigger,
	verbose = false,
	Promise = require( 'promise' ),
	fs		= require( 'fs' ),
	http	= require( 'http' ),
	https	= require( 'https' ),
	
	promiseChain = new Promise(function(fulfill){ loadTrigger = fulfill; });


	process.argv.slice(2).forEach(function(path){
		if ( path == "-v" ){ verbose = true; return; }

		promiseChain = promiseChain.then((function( path ){
			return function() {
				if ( verbose ) process.stderr.write( `Processing \`${path}\`... ` );

				return new Promise(function( fulfill, reject ){
					try {

						if ( path.substr( 0, 7 ).toLowerCase() == "http://" )
						{
							http.get(path, function(res){
								res.on( 'end', function(){
									if ( verbose ) process.stderr.write( `done!\n` ); 
									process.stdout.write( "\n" ); fulfill(); 
								});
								res.pipe(process.stdout);
							})
							.on( 'error', function( e ){ throw e; });

							return;
						}
						
						if ( path.substr( 0, 8 ).toLowerCase() == "https://" )
						{
							https.get(path, function(res){
								res.on( 'end', function(){
									if ( verbose ) process.stderr.write( `done!\n` ); 
									process.stdout.write( "\n" ); fulfill(); 
								});
								res.pipe(process.stdout);
							})
							.on( 'error', function( e ){ throw e; });
							return;
						}

						
						var stream = fs.createReadStream( path, { autoClose:false } );
						stream.pipe(process.stdout);
						stream.on( 'end', function(){
							if ( verbose ) process.stderr.write( `done!\n` ); 
							stream.close(); process.stdout.write( "\n" ); fulfill(); 
						});
					}
					catch( err )
					{
						process.stderr.write( ` access error!` );
						fulfill();
					}
				});
			};
		})( path ));
	});

	setTimeout( loadTrigger, 0 );
})();