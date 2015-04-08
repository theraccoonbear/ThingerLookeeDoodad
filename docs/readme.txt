Install Dependencies:

	$ curl -sS https://getcomposer.org/installer | php
	
	$ php composer.phar install


Configure URL Rewriting:

	Setup the following for your <Directory ...> in the hosts or .htaccess file:
	
	<IfModule mod_rewrite.c>
			Options -MultiViews
	
			RewriteEngine On
			#RewriteBase /path/to/app
			RewriteCond %{REQUEST_FILENAME} !-f
			RewriteRule ^ index.php [QSA,L]
	</IfModule>