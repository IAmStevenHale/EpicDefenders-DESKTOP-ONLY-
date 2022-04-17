const canvas = document.getElementById('canvas1')
const ctx = canvas.getContext('2d')
canvas.width = 900
canvas.height = 600
//
// global variables
const cellSize = 100
const cellGap = 3
const gameGrid = []
const defenders = []
let numberOfResources = 300
const enemies = []
const enemyPositions = []
let enemiesInterval = 303
let frame = 0
let gameOver = false
let score = 0
const projectiles = []
const resources = []
const winningScore = 1000
let chosenDefender = 1
let defenderCost = 0

// mouse
const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
  clicked: false,
}
canvas.addEventListener('mousedown', function () {
  mouse.clicked = true
})
canvas.addEventListener('mouseup', function () {
  mouse.clicked = false
})
let canvasPosition = canvas.getBoundingClientRect()
canvas.addEventListener('mousemove', function (e) {
  mouse.x = e.x - canvasPosition.left
  mouse.y = e.y - canvasPosition.top
})
canvas.addEventListener('mouseleave', function (e) {
  mouse.x = undefined
  mouse.y = undefined
})

// game board
const controlsBar = {
  width: canvas.width,
  height: cellSize,
}

class Cell {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = cellSize
    this.height = cellSize
  }
  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      ctx.strokeStyle = 'black'
      ctx.strokeRect(this.x, this.y, this.width, this.height)
    }
  }
}
function createGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize) {
    for (let x = 0; x < canvas.width; x += cellSize) {
      gameGrid.push(new Cell(x, y))
    }
  }
}
createGrid()
function handleGameGrid() {
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw()
  }
}

// projectiles
class Projectiles {
  constructor(x, y, colour, power, size, speed, knockBack, slow) {
    this.x = x
    this.y = y
    this.colour = colour
    this.width = size
    this.height = size
    this.power = power
    this.speed = speed
    this.knockBack = knockBack
    this.slow = slow
  }
  update() {
    this.x += this.speed
  }
  draw() {
    ctx.fillStyle = this.colour
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2)
    ctx.fill()
  }
}
function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update()
    projectiles[i].draw()

    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        projectiles[i] &&
        collision(enemies[j], projectiles[i])
      ) {
        enemies[j].health -= projectiles[i].power
        if (projectiles[i].knockBack) {
          // console.log(enemies[j].movement)
          enemies[j].movement = -20
        }
        if (projectiles[i].slow && enemies[j].movement > 0) {
          // console.log(enemies[j].movement)
          enemies[j].movement -= 0.05
        }
        projectiles.splice(i, 1)
        i--
      }
    }

    if (projectiles[i] && projectiles[i].x > canvas.width) {
      projectiles.splice(i, 1)
      i--
    }
  }
}
// towers/defenders
const fireDefender = new Image()
fireDefender.src = 'Assets/Defenders/Fire Defender.png'
const iceDefender = new Image()
iceDefender.src = 'Assets/Defenders/Ice Defender.png'
const airDefender = new Image()
airDefender.src = 'Assets/Defenders/Air Defender.png'
const powerDefender = new Image()
powerDefender.src = 'Assets/Defenders/Power Defender.png'
const wall = new Image()
wall.src = 'Assets/Defenders/Wall.png'

class Defender {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = cellSize - cellGap * 2
    this.height = cellSize - cellGap * 2
    this.shooting = false
    this.health = 100
    this.projectiles = []
    this.timer = 0
    this.frameX = 0
    this.frameY = 0
    this.spriteHeight = 954
    this.spriteWidth = 1020
    this.minFrame = 0
    this.maxFrame = 12
    this.shootNow = false
    this.chosenDefender = chosenDefender
    if (this.chosenDefender === 1) {
      this.projectileColour = 'red'
      this.projectileSize = 10
      this.projectilePower = 20
      this.projectileSpeed = 5
      this.projectileKnockBack = false
      this.projectileSlow = false
      numberOfResources -= defenderCost
    } else if (this.chosenDefender === 2) {
      this.projectileColour = 'blue'
      this.projectileSize = 10
      this.projectilePower = 10
      this.projectileSpeed = 5
      this.projectileKnockBack = false
      this.projectileSlow = true
      numberOfResources -= defenderCost
    } else if (this.chosenDefender === 3) {
      this.projectileColour = 'white'
      this.projectileSize = 20
      this.projectilePower = 20
      this.projectileSpeed = 10
      this.projectileKnockBack = true
      this.projectileSlow = false
      numberOfResources -= defenderCost
    } else if (this.chosenDefender === 4) {
      this.projectileColour = 'black'
      this.projectileSize = 30
      this.projectilePower = 40
      this.projectileSpeed = 2
      this.projectileKnockBack = true
      this.projectileSlow = true
      numberOfResources -= defenderCost
    } else if (this.chosenDefender === 5) {
      this.defenderCost = 50
      this.projectileColour = 'red'
      this.projectileSize = 10
      this.projectilePower = 20
      this.projectileSpeed = 5
      this.projectileKnockBack = false
      this.projectileSlow = false
      numberOfResources -= defenderCost
    }
  }
  draw() {
    // ctx.fillStyle = 'blue'
    // ctx.fillRect(this.x, this.y, this.width, this.height)

    if (this.chosenDefender === 1) {
      ctx.drawImage(
        fireDefender,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      )
    } else if (this.chosenDefender === 2) {
      ctx.drawImage(
        iceDefender,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      )
    } else if (this.chosenDefender === 3) {
      ctx.drawImage(
        airDefender,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      )
    } else if (this.chosenDefender === 4) {
      ctx.drawImage(
        powerDefender,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      )
    } else if (this.chosenDefender === 5) {
      ctx.drawImage(
        wall,
        0,
        0,
        500,
        500,
        this.x,
        this.y,
        cellSize - cellGap * 2,
        cellSize - cellGap * 2
      )
    }
    ctx.fillStyle = 'black'
    ctx.font = '30px Orbitron'
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 80)
  }
  update() {
    if (frame % 8 === 0) {
      if (this.frameX < this.maxFrame) {
        this.frameX++
      } else {
        this.frameX = this.minFrame
      }
      if (this.frameX === 10) {
        this.shootNow = true
      }
    }

    if (this.chosenDefender === 1) {
      if (this.shooting) {
        this.minFrame = 8
        this.maxFrame = 12
        this.minFrame = 0
      } else {
        this.minFrame = 0
        this.maxFrame = 7
      }
    } else if (this.chosenDefender === 2) {
      if (this.shooting) {
        this.minFrame = 8
        this.maxFrame = 12
        this.minFrame = 0
      } else {
        this.minFrame = 0
        this.maxFrame = 7
      }
    } else if (this.chosenDefender === 3) {
      if (this.shooting) {
        this.minFrame = 8
        this.maxFrame = 12
        this.minFrame = 0
      } else {
        this.minFrame = 0
        this.maxFrame = 7
      }
    } else if (this.chosenDefender === 4) {
      if (this.shooting) {
        this.minFrame = 8
        this.maxFrame = 15
        this.minFrame = 0
      } else {
        this.minFrame = 0
        this.maxFrame = 7
      }
    } else if (this.chosenDefender === 5) {
      if (this.shooting) {
        this.minFrame = 0
        this.maxFrame = 0
      }
    }

    if (this.shooting && this.shootNow && this.chosenDefender !== 5) {
      projectiles.push(
        new Projectiles(
          this.x + 70,
          this.y + 50,
          this.projectileColour,
          this.projectilePower,
          this.projectileSize,
          this.projectileSpeed,
          this.projectileKnockBack,
          this.projectileSlow
        )
      )
      this.shootNow = false
    }
  }
}

function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw()
    defenders[i].update()
    if (enemyPositions.indexOf(defenders[i].y) !== -1) {
      defenders[i].shooting = true
    } else {
      defenders[i].shooting = false
    }
    for (let j = 0; j < enemies.length; j++) {
      if (defenders[i] && collision(defenders[i], enemies[j])) {
        enemies[j].movement = 0
        defenders[i].health -= 0.2
      }
      if (defenders[i] && defenders[i].health <= 0) {
        defenders.splice(i, 1)
        i--
        enemies[j].movement = enemies[j].speed
      }
    }
  }
}
const card1 = {
  x: 10,
  y: 10,
  width: 100,
  height: 85,
}
const card2 = {
  x: 120,
  y: 10,
  width: 100,
  height: 85,
}
const card3 = {
  x: 230,
  y: 10,
  width: 100,
  height: 85,
}
const card4 = {
  x: 340,
  y: 10,
  width: 100,
  height: 85,
}
const card5 = {
  x: 450,
  y: 10,
  width: 100,
  height: 85,
}

function chooseDefender() {
  let card1Stroke = 'black'
  let card2Stroke = 'black'
  let card3Stroke = 'black'
  let card4Stroke = 'black'
  let card5Stroke = 'black'
  if (collision(mouse, card1) && mouse.clicked) {
    chosenDefender = 1
  } else if (collision(mouse, card2) && mouse.clicked) {
    chosenDefender = 2
  } else if (collision(mouse, card3) && mouse.clicked) {
    chosenDefender = 3
  } else if (collision(mouse, card4) && mouse.clicked) {
    chosenDefender = 4
  } else if (collision(mouse, card5) && mouse.clicked) {
    chosenDefender = 5
  }

  if (chosenDefender === 1) {
    card1Stroke = 'gold'
    card2Stroke = 'black'
    card3Stroke = 'black'
    card4Stroke = 'black'
    card5Stroke = 'black'
    defenderCost = 100
  } else if (chosenDefender === 2) {
    card1Stroke = 'black'
    card2Stroke = 'gold'
    card3Stroke = 'black'
    card4Stroke = 'black'
    card5Stroke = 'black'
    defenderCost = 100
  } else if (chosenDefender === 3) {
    card1Stroke = 'black'
    card2Stroke = 'black'
    card3Stroke = 'gold'
    card4Stroke = 'black'
    card5Stroke = 'black'
    defenderCost = 150
  } else if (chosenDefender === 4) {
    card1Stroke = 'black'
    card2Stroke = 'black'
    card3Stroke = 'black'
    card4Stroke = 'gold'
    card5Stroke = 'black'
    defenderCost = 300
  } else if (chosenDefender === 5) {
    card1Stroke = 'black'
    card2Stroke = 'black'
    card3Stroke = 'black'
    card4Stroke = 'black'
    card5Stroke = 'gold'
    defenderCost = 50
  } else {
    card1Stroke = 'black'
    card2Stroke = 'black'
    card3Stroke = 'black'
    card4Stroke = 'black'
    card5Stroke = 'black'
    defenderCost = 0
  }

  ctx.lineWidth = 2
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.fillRect(card1.x, card1.y, card1.width, card1.height)
  ctx.strokeStyle = card1Stroke
  ctx.strokeRect(card1.x, card1.y, card1.width, card1.height)
  ctx.drawImage(
    fireDefender,
    0,
    0,
    1020,
    954,
    card1.x,
    card1.y + 10,
    cellSize - cellGap * 2,
    cellSize - cellGap * 2
  )
  ctx.fillRect(card2.x, card2.y, card2.width, card2.height)
  ctx.strokeStyle = card2Stroke
  ctx.strokeRect(card2.x, card2.y, card2.width, card2.height)
  ctx.drawImage(
    iceDefender,
    0,
    0,
    1020,
    954,
    card2.x,
    card2.y + 10,
    cellSize - cellGap * 2,
    cellSize - cellGap * 2
  )
  ctx.fillRect(card3.x, card3.y, card3.width, card3.height)
  ctx.strokeStyle = card3Stroke
  ctx.strokeRect(card3.x, card3.y, card3.width, card3.height)
  ctx.drawImage(
    airDefender,
    0,
    0,
    1020,
    954,
    card3.x,
    card3.y + 10,
    cellSize - cellGap * 2,
    cellSize - cellGap * 2
  )
  ctx.fillRect(card4.x, card4.y, card4.width, card4.height)
  ctx.strokeStyle = card4Stroke
  ctx.strokeRect(card4.x, card4.y, card4.width, card4.height)
  ctx.drawImage(
    powerDefender,
    0,
    0,
    1020,
    954,
    card4.x,
    card4.y + 10,
    cellSize - cellGap * 2,
    cellSize - cellGap * 2
  )
  ctx.fillRect(card5.x, card5.y, card5.width, card5.height)
  ctx.strokeStyle = card5Stroke
  ctx.strokeRect(card5.x, card5.y, card5.width, card5.height)
  ctx.drawImage(
    wall,
    0,
    0,
    800,
    800,
    card5.x + 21,
    card5.y + 14,
    cellSize - cellGap * 2,
    cellSize - cellGap * 2
  )
}

// Floating Messages
const floatingMessages = []
class FloatingMessage {
  constructor(value, x, y, size, colour) {
    this.value = value
    this.x = x
    this.y = y
    this.size = size
    this.lifespan = 0
    this.colour = colour
    this.opacity = 1
  }
  update() {
    this.y -= 0.3
    this.lifespan += 1
    if (this.opacity > 0.03) {
      this.opacity -= 0.03
    }
  }
  draw() {
    ctx.globalAlpha = this.opacity
    ctx.fillStyle = this.colour
    ctx.font = this.size + 'px Orbitron'
    ctx.fillText(this.value, this.x, this.y)
    ctx.globalAlpha = 1
  }
}
function handleFloatingMessages() {
  for (let i = 0; i < floatingMessages.length; i++) {
    floatingMessages[i].update()
    floatingMessages[i].draw()
    if (floatingMessages[i].lifespan >= 50) {
      floatingMessages.splice(i, 1)
      i--
    }
  }
}
const enemyTypes = []
const knight = new Image()
knight.src = 'Assets/Knights/knight_walk 1.png'
enemyTypes.push(knight)
const knight2 = new Image()
knight2.src = 'Assets/Knights/knight_walk 2.png'
enemyTypes.push(knight2)
const knight3 = new Image()
knight3.src = 'Assets/Knights/knight_walk 3.png'
enemyTypes.push(knight3)

// enemies
class Enemy {
  constructor(verticalPosition) {
    this.x = canvas.width
    this.y = verticalPosition
    this.width = cellSize - cellGap * 2
    this.height = cellSize - cellGap * 2
    this.speed = Math.random() * 0.2 + 0.4
    this.movement = this.speed
    this.health = 100
    this.maxHealth = this.health
    this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]
    this.frameX = 0
    this.frameY = 0
    this.minFrame = 0
    this.maxFrame = 9
    this.spriteWidth = 1250
    this.spriteHeight = 1141
  }
  update() {
    this.x -= this.movement
    if (frame % 4 === 0) {
      if (this.frameX < this.maxFrame) {
        this.frameX++
      } else {
        this.frameX = this.minFrame
      }
    }
    if (this.movement < 0) {
      this.movement = this.speed
    }
  }
  draw() {
    // ctx.fillStyle = 'red'
    //  ctx.fillRect(this.x, this.y, this.width, this.height)
    ctx.fillStyle = 'black'
    ctx.font = '30px Orbitron'
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30)
    //ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
    ctx.drawImage(
      this.enemyType,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
}
function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update()
    enemies[i].draw()
    if (enemies[i].x < 0) {
      gameOver = true
      // console.log(gameOver)
    }
    if (enemies[i].health <= 0) {
      let gainedResources = enemies[i].maxHealth / 10
      floatingMessages.push(
        new FloatingMessage(
          '+' + gainedResources,
          enemies[i].x,
          enemies[i].y,
          30,
          'black'
        )
      )
      floatingMessages.push(
        new FloatingMessage('+' + gainedResources, 750, 50, 30, 'black')
      )
      numberOfResources += gainedResources
      score += gainedResources
      const findThisIndex = enemyPositions.indexOf(enemies[i].y)
      enemyPositions.splice(findThisIndex, 1)
      enemies.splice(i, 1)
      i--
    }
  }
  if (frame % enemiesInterval === 0) {
    let verticalPosition =
      Math.floor(Math.random() * 5 + 1) * cellSize + cellGap
    enemies.push(new Enemy(verticalPosition))
    enemyPositions.push(verticalPosition)

    if (enemiesInterval > 1) {
      enemiesInterval -= 3
    }
  }
}

// resources
const amounts = [20, 20, 20, 30, 30, 40, 40, 40, 50, 100]
class Resource {
  constructor() {
    this.x = Math.random() * canvas.width - cellSize
    this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25
    this.width = cellSize * 0.6
    this.height = cellSize * 0.6
    this.amount = amounts[Math.floor(Math.random() * amounts.length)]
  }
  draw() {
    ctx.fillStyle = 'yellow'
    ctx.fillRect(this.x, this.y, this.width, this.height)
    ctx.fillStyle = 'black'
    ctx.font = '20px Orbitron'
    ctx.fillText(this.amount, this.x + 15, this.y + 25)
  }
}
function handleResources() {
  if (frame % 500 === 0 && score < winningScore) {
    resources.push(new Resource())
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].draw()
    if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
      numberOfResources += resources[i].amount
      floatingMessages.push(
        new FloatingMessage(
          '+' + resources[i].amount,
          resources[i].x,
          resources[i].y,
          30,
          'black'
        )
      )
      floatingMessages.push(
        new FloatingMessage('+' + resources[i].amount, 750, 50, 30, 'black')
      )
      resources.splice(i, 1)
      i--
    }
  }
}

// utilities
function handleGameStatus() {
  ctx.fillStyle = 'gold'
  ctx.font = '30px Orbitron'
  ctx.fillText('Score: ' + score, 575, 40)
  ctx.fillText('Resources: ' + numberOfResources, 575, 80)
  if (gameOver) {
    ctx.fillStyle = 'black'
    ctx.font = '90px Orbitron'
    ctx.fillText('GAME OVER', 135, 330)
  }
  if (score >= winningScore && enemies.length === 0) {
    ctx.fillStyle = 'black'
    ctx.font = '60px Orbitron'
    ctx.fillText('LEVEL COMPLETE', 135, 330)
    ctx.font = '30px Orbitron'
    ctx.fillText('You win with ' + score + ' points!', 134, 370)
  }
}
canvas.addEventListener('click', function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap
  if (gridPositionY < cellSize) return
  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) {
      return
    }
  }
  if (numberOfResources >= defenderCost) {
    defenders.push(new Defender(gridPositionX, gridPositionY))
  } else {
    floatingMessages.push(
      new FloatingMessage('Need more resources', mouse.x, mouse.y, 20, 'blue')
    )
  }
})
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'blue'
  ctx.fillRect(0, 0, controlsBar.width, controlsBar.height)
  handleGameGrid()
  handleDefenders()
  handleResources()
  handleProjectiles()
  handleEnemies()
  chooseDefender()
  handleGameStatus()
  handleFloatingMessages()
  // console.log(frame + ' - ' + enemiesInterval)
  frame++

  if (!gameOver) {
    requestAnimationFrame(animate)
  }
}
animate()

function collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true
  }
  return false
}

window.addEventListener('resize', function () {
  canvasPosition = canvas.getBoundingClientRect()
})
