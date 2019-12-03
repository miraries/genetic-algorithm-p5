let looping = false
let sliderMutation
let sliderFramerate


const setupGui = function() {
    button = createButton('Start');
    button.position(900,35);
    button.mousePressed(() => {
        const temp = looping
        looping = !looping
        temp ? noLoop() : loop()
        button.html(looping ? 'Pause' : 'Start')
    });

    sliderMutation = createSlider(0, 10000);
    sliderMutation.position(900, 120);
    sliderMutation.style('width', '100px')

    sliderFramerate = createSlider(1, 60);
    sliderFramerate.position(900, 150);
    sliderFramerate.style('width', '100px')
}