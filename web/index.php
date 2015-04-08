<?php


function pr($obj) {
	print '<pre>';
	print_r($obj);
	print '</pre>';
}

require_once __DIR__.'/../vendor/autoload.php';

use Silex\Application;
use Silex\Provider;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\HttpKernelInterface;

use Silex\Provider\DoctrineServiceProvider;
use Silex\Provider\ValidatorServiceProvider;
use Silex\Provider\TranslationServiceProvider;
use Silex\Provider\FormServiceProvider;
use Silex\Provider\TwigServiceProvider;
use Silex\Provider\UrlGeneratorServiceProvider;
use Silex\Provider\SessionServiceProvider;
use Silex\Provider\SecurityServiceProvider;



use Symfony\Component\HttpFoundation\Session\Storage\Handler\PdoSessionHandler;


use Doctrine\DBAL\Schema\Table;

$app = new Silex\Application();

$app['debug'] = true;

if ($app['debug']) {
	ini_set('display_errors',1);
	ini_set('display_startup_errors',1);
	//ERROR_REPORTING(-1);
	ERROR_REPORTING(E_ALL & ~E_STRICT & ~E_DEPRECATED & ~E_NOTICE);
}


// register twig
$app->register(new TwigServiceProvider());

$app['twig.loader.filesystem'] = new Twig_Loader_Filesystem();
$app['twig.loader.filesystem']->prependPath(__DIR__ . '/../tmpl/');


$app->match('/', function ($stuff = false) use ($app) {
	return $app['twig']->render('home.twig.html', array('copy' => 'AHA!'));
});


$app->match('/api/template/{name}', function($name) use ($app) {
	$name = preg_replace('/[^A-Za-z0-9-]/', '', $name);
	$tmpl_path = __DIR__ . '/../templates/' . $name . '.mst.html';
	if (!file_exists($tmpl_path)) {
		return new Response(
			'MISSING TEMPLATE',
			404,
			array('Content-Type' => 'text/plain')
		);
	} else {
		return file_get_contents($tmpl_path);
	}

});

$app->run();