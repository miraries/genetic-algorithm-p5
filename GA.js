class GA {
    constructor() {
        this.cities = []
        this.population = []
        this.fitness = []
        this.bestDistance = Infinity
        this.totalBest = []
        this.currentBest = []
        this.mutationRate = 0.01
        this.generationCounter = 0
        this.fitnessHistory = ['Fitness']
    }

    generateRandomCities(citiesSize) {
        for (let i = 0; i < citiesSize; i++) {
            const v = createVector(random(width / 2), random(height / 2))
            this.cities[i] = v
        }
    }

    importDataset(data) {
        this.cities = []

        for (const row of data) {
            this.cities.push(createVector(row[1], row[2]))
        }
    }

    generateRandomPopulation(populationSize) {
        const order = [...Array(this.cities.length).keys()]

        for (let i = 0; i < populationSize; i++) {
            this.population[i] = shuffle(order)
        }
    }

    invertScale(coord) {
        const scaled = coord * sliderScaling.value()
        return invertCheckbox.checked() ? height / 2 - scaled : scaled
    }

    drawTotalBest() {
        this.drawOrder(this.totalBest)
    }

    drawCurrentBest() {
        push()
        translate(0, height / 2)
        this.drawOrder(this.currentBest)
        pop()
    }

    drawOrder(order) {
        stroke(0)
        strokeWeight(4)
        noFill()
        const _ = this
        const S = (x) => x * sliderScaling.value()
        const iS = _.invertScale

        for (let i = 0; i < order.length; i++) {
            const n = order[i]
            const nNext = order[i + 1]
            const color = map(i, 0, order.length, 0, 255)
            stroke(color, 255 - color, color)

            if (nNext !== null && nNext !== undefined)
                line(S(_.cities[n].x), iS(_.cities[n].y), S(_.cities[nNext].x), iS(_.cities[nNext].y))

            if (i == 0 || i == order.length - 1)
                fill(0)
            else
                noFill()

            ellipse(S(_.cities[n].x), iS(_.cities[n].y), 8, 8)
        }

        line(S(_.cities[order[0]].x), iS(_.cities[order[0]].y), S(_.cities[order[order.length - 1]].x), iS(_.cities[order[order.length - 1]].y))
    }

    updateGui() {
        this.mutationRate = sliderMutation ? sliderMutation.value() / 10000 : 0.01
        this.populationSize = sliderPopulation ? sliderPopulation.value() : 500
        frameRate(sliderFramerate ? sliderFramerate.value() : 60)
        strokeWeight(0)
        textStyle(BOLD)
        textSize(24)
        fill(0)
        translate(width / 2 + 50, 0)
        text(`Generation: ${this.generationCounter}`, 50, 50)
        text(`Record distance: ${floor(this.bestDistance)}`, 50, 80)
        text(`Mutation rate: ${this.mutationRate}`, 50, 110)
        text(`Cities size: ${this.cities.length}`, 50, 140)
        text(`Population size: ${this.populationSize}`, 50, 170)
        text(`Framerate: ${round(frameRate())}`, 50, 200)
        text(`Scaling: ${sliderScaling.value()}`, 50, 230)
        text(`Invert: ${invertCheckbox.checked()}`, 50, 260)
    }

    static calculatePointDistance(p, q) {
        return sqrt((p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y))
    }

    static calculatePathDistance(points, order) {
        let sum = 0

        for (let i = 0; i < order.length - 1; i++) {
            const cityA = points[order[i]]
            const cityB = points[order[i + 1]]
            const d = this.calculatePointDistance(cityA, cityB)
            sum += d
        }

        sum += this.calculatePointDistance(points[order[order.length - 1]], points[order[0]])

        return sum
    }

    calculateFitness() {
        let currentBestDistance = Infinity

        for (let i = 0; i < this.population.length; i++) {
            const distance = GA.calculatePathDistance(this.cities, this.population[i])

            if (distance < this.bestDistance) {
                this.bestDistance = distance
                this.totalBest = this.population[i]
            }
            if (distance < currentBestDistance) {
                currentBestDistance = distance
                this.currentBest = this.population[i]
            }

            // Exponential increment
            this.fitness[i] = 1 / (pow(distance, 8) + 1)
        }

        this.logFitness()
    }

    logFitness() {
        if (this.generationCounter % 20 !== 0)
            return
        if (this.fitnessHistory.length > 100)
            this.fitnessHistory.splice(1, 1)

        this.fitnessHistory.push(max(this.fitness))
        chart.load({
            columns: [this.fitnessHistory]
        })
    }

    normalizeFitness() {
        let sum = this.fitness.reduce((a, b) => a + b)

        this.fitness = this.fitness.map(f => f / sum)
    }

    generateRandomN(n) {
        let children = []

        for (let u = 0; u < n; u++) {
            children.push(shuffle([...Array(gaInstance.cities.length).keys()]))
        }

        return children
    }

    regenerate() {
        let newPopulation = []

        for (let i = 0; i < this.population.length; i++) {
            const orderA = this.pickOne()
            const orderB = this.pickOne()
            let order = GA.crossOver(orderA, orderB)
            this.mutate(order)
            newPopulation[i] = order
        }

        const tempHistory = this.fitnessHistory.slice(-10)
        let shouldAddRandomAnyway = tempHistory.every((val, i, arr) => val <= tempHistory[0] + 20)
        
        const bestChildren = this.pickBest(floor(random(200, 300)))
        const newRandom = this.generateRandomN(floor(bestChildren.mutated || shouldAddRandomAnyway ? random(3, 5) : random(100, 200)))
        
        console.log({ mutated: bestChildren.mutated, shouldAddRandomAnyway})

        this.population = [...newPopulation.slice(bestChildren.children.length + newRandom.length + 1), ...bestChildren.children, ...newRandom, this.mutate(this.totalBest)]
        this.generationCounter++
    }

    static crossOver(orderA, orderB) {
        const start = floor(random(orderA.length))
        const end = floor(random(start + 1, orderA.length))
        const childOrder = orderA.slice(start, end)

        for (let i = 0; i < orderB.length; i++) {
            const cityIndex = orderB[i]
            if (!childOrder.includes(cityIndex)) {
                childOrder.push(cityIndex)
            }
        }

        return childOrder
    }

    mutateReal(order) {
        for (let i = 0; i < order.length; i++) {
            if (random(1) < this.mutationRate) {
                const i1 = floor(random(order.length))
                const i2 = (i1 + 1) % this.cities.length // handle overflow
                GA.swap(order, i1, i2)
            }
        }
    }

    mutate(order) {
        if (random(1) > this.mutationRate)
            return order

        for (let i = 0; i < floor(random(10)); i++) {
            const index1 = floor(random(0, order.length))
            const index2 = floor(random(index1, order.length))

            const part = order.slice(index1, index2).reverse()
            order = [...(new Set(order.slice(0, index1).concat(part).concat(order.slice(index1, order.length))))]
        }

        return order
    }

    static swap(a, i, j) {
        const temp = a[i]
        a[i] = a[j]
        a[j] = temp
    }

    // Some probability magic
    pickOne() {
        let index = 0, r = random(1)

        while (r > 0)
            r -= this.fitness[index++]

        return this.population[--index].slice()
    }

    pickBest(n) {
        const fitnessClone = this.fitness.slice()
        let children = []
        let mutated = false

        for (let i = 0; i < n; i++) {
            let max = Math.max(...fitnessClone)
            let tempChild = this.population[fitnessClone.indexOf(max)]

            const tempHistory = this.fitnessHistory.slice(-5)
            if (tempHistory.every((val, i, arr) => val <= tempHistory[0] + 20)){
                this.mutate(tempChild)
                mutated = true
            }

            children.push(tempChild)
            fitnessClone.splice(fitnessClone.indexOf(max), 1)
        }

        return {children, mutated}
    }
}
