var current= new Date();
var day_night=current.getHours();
if (day_night<=19.5 && day_night>=8) {
    console.log('day');
    document.body.style.backgroundImage = "url('/images/day.jpg')";
} else {
    console.log('night');
    document.body.style.backgroundImage = "url('/images/night.jpg')";
}