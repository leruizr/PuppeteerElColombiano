/*
//import GPT4 from 'gpt.js';
const GPT4 = require('./gpt');

//let GPT = new GPT4('./gpt4all-lora-quantized-OSX-m1');
let GPT = new GPT4('./gpt4all');
GPT.on('ready',async ()=>{
  console.log(await GPT.ask("What is the capital of Korea?"));
  console.log(await GPT.ask("Are you an AI?"));
});
*/


const puppeteer = require('puppeteer');
const numPaginas = 2;
//const categorias = ["salud", "talento humano", "movilidad", "competitividad de empresas", "consumidor"];
const categorias = ["salud"];

(async () => {

    // Abrir el navegador y navegar a la página
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();    
    await page.goto('https://www.elcolombiano.com');

    // Recorrer cada categoria para buscarlas y extraer las urls
    let urls = [];
    for (let categoria of categorias)
    {
        // Click en botón buscar
        await page.click('#buscador_redi');
        await page.waitForSelector('.iter-field-element > input');

        // Digitar texto a buscar y dar click en buscar
        await page.type('.iter-field-element > input', categoria);
        await page.click('.iter-button-content > input');

        // Esperar a que termine la busqueda
        await page.waitForSelector('.next-button');
        
        // Extraer urls de las páginas
        let enlaces = await ExtraerUrl(page);

        // Concatenar todas las urls obtenidas
        urls = [].concat(urls, enlaces);
    }

    // Abrir cada url para extraer la información
    let noticias = [];
    for (let url of urls)
    {
        await page.goto(url, {timeout: 0});
        await page.waitForSelector('h1 .priority-content');

        // Extraer la información de la noticia
        const noticia = await page.evaluate(() => {
            const datos = {};
            datos.titulo = document.querySelector('h1 .priority-content').innerText;
            datos.hora = document.querySelector('.autor .hora-noticia').innerText;
            datos.urlImagen = document.querySelector('.imagen-noticia img').src;
            let parrafos = document.querySelectorAll('.paragraph > p');
            datos.detalle = '';            
            for (let parrafo of parrafos)
            {
                datos.detalle = datos.detalle + parrafo.innerText + " ";
            }
            return datos;
        });

        console.log(url);
        console.log(noticia);
        console.log('--------------------------------------------------------------------');

        // Concatenar todas las noticias
        //noticias = [].concat(noticias, noticia);
    }
    console.log(noticias.length);
    console.log(noticias);

    // Cerrar el navegador
    await browser.close();  

})();


async function ExtraerUrl(page)
{
    const enlaces = await page.evaluate(() => {
        // Obtener urls de las imagenes de las noticias
        const elements = document.querySelectorAll('.container-noticia-seccion-metadatos > .image-wrapper > a');

        // Recorrer las urls y guardarlas en un arreglo
        const links = [];
        for (let element of elements)
        {
            links.push(element.href);
        }
        return links;
    });
    // retornar arreglo con urls
    return enlaces;
}
