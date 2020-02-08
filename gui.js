let looping = false
let sliderMutation
let sliderFramerate
let sliderScaling
let sliderPopulation
let invertCheckbox

const setupGui = function () {
    btnStart = createButton('Start')
    btnStart.position(900, 35)
    btnStart.mousePressed(() => {
        if (gaInstance.population.length == 0)
            gaInstance.generateRandomPopulation(sliderPopulation.value())

        const temp = looping
        looping = !looping
        temp ? noLoop() : loop()
        btnStart.html(looping ? 'Pause' : 'Start')
    });

    btnImport = createButton('Import Dataset')
    btnImport.position(900, 65)
    btnImport.mousePressed(() => {
        if (gaInstance.population.length != 0)
            return alert('Dataset can only be imported before starting')

        gaInstance.importDataset(berlinDataset)
        sliderScaling.value(0.3)
        invertCheckbox.checked(true)
        alert('Imported dataset, adjusted scaling to 0.3 and inverted the canvas vertically')
    });

    sliderMutation = createSlider(0, 10000, 100)
    sliderMutation.position(900, 97)
    sliderMutation.style('width', '100px')

    sliderPopulation = createSlider(50, 10000, 500)
    sliderPopulation.position(900, 157)
    sliderPopulation.style('width', '100px')

    sliderFramerate = createSlider(1, 60)
    sliderFramerate.position(900, 187)
    sliderFramerate.style('width', '100px')

    sliderScaling = createSlider(0, 1, 1, 0.05)
    sliderScaling.position(900, 220)
    sliderScaling.style('width', '100px')

    invertCheckbox = createCheckbox('', false)
    invertCheckbox.position(900, 250)
}