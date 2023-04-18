const express = require('express');
const http = require('http');
const url = require('url');
const app = express();
const pool = require('./connection');
const PORT = 4000;
const turf = require('@turf/turf');
app.set("view engine", "ejs");
app.set("views", "./view")
app.use(express.static(__dirname + "/public"))
const bodyParser = require("body-parser")
  


app.use(bodyParser.urlencoded({
    extended:true
}));


app.get('/',(req,res)=>{
    res.render('mina');
});









app.get('/mapGeojson-api',(req,res)=>{
    let qry = "SELECT ST_AsGeoJson(ST_Transform(ST_SetSRID(geom, 4326), 3857)) from public.mina_khema_nos;";
    pool.query(qry,(err,result)=>{
        if(err)throw err;
        else {
            var result =  result.rows;
            let mapGeoJson = {"type":"FeatureCollection","features":[]};
            for(let i = 0;i<result.length;i++){
                let jsonData = JSON.parse(result[i].st_asgeojson);
                let plotGeoJson =  {"type":"Feature","properties":{"plot_no_en":""},"geometry":{"type":"Polygon","coordinates":[]}};
                let tempCoordinates = [];
                for(let i = 0;i<jsonData.coordinates[0][0].length;i++){
                    let utm = turf.point([jsonData.coordinates[0][0][i][0], jsonData.coordinates[0][0][i][1]]);
                    let latlong = turf.toWgs84(utm);
                
                    tempCoordinates.push(latlong.geometry.coordinates);
                }
                plotGeoJson.geometry.coordinates = [tempCoordinates]
                mapGeoJson.features.push(plotGeoJson);
            }
            res.send(mapGeoJson);
        }
    });
})








app.listen(PORT,()=>{
    console.log(`PORT is listen on ${PORT}`);
})
