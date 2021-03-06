const Koa = require('koa')
const KoaStatic = require('koa-static')
const bodyParser = require('koa-bodyparser')
const Router = require('@koa/router')
const { readFileSync, readdirSync, statSync, writeFileSync, existsSync, mkdirSync, rmSync } = require('fs')
const open = require('open')
const { join } = require('path')

const app = new Koa()
const router = new Router()

app.use(bodyParser())

router.get('/list', function (ctx) {
  // Get the directories
  const directories = readdirSync('objects').filter(f => statSync(join('objects', f)).isDirectory())
  // Build the data map
  const data = directories.map(function (d) {
    const dataJsonFilepath = join('objects', d, 'data.json')
    const descriptionFilepath = join('objects', d, 'description.txt')
    let dataJson = { // default
      title: d,
      date: Date.now(),
      price: 0
    }
    let description = ''

    /* Get the data.json or create it if it doesn't exist */
    try {
      dataJson = JSON.parse(readFileSync(dataJsonFilepath))
    }
    catch (e) {
      // console.log('creating files')
      // Create the file if it doesn't exist
      writeFileSync(dataJsonFilepath, JSON.stringify(dataJson, null, 2))
    }

    /* Get the description.txt or create it if it doesn't exist */
    try {
      description = readFileSync(descriptionFilepath).toString()
    }
    catch (e) {
      // console.log('creating description file')
      writeFileSync(descriptionFilepath, description)
    }

    /* Create the img directory if it doesn't exist */
    // @TODO: move image files (if any) from the root to the newly created directory
    if (!existsSync(join('objects', d, 'img'))) {
      mkdirSync(join('objects', d, 'img'))
    }

    return [d, { ...dataJson, description }]
  })
  ctx.body = Object.fromEntries(data)
})

router.post('/update/:dirname', function (ctx) {
  // Get the data.json
  const object = JSON.parse(readFileSync(join('objects', ctx.params.dirname, 'data.json')))
  // Update the date
  object.date = Date.now()
  // Save the data.json
  writeFileSync(join('objects', ctx.params.dirname, 'data.json'), JSON.stringify(object, null, 2))
  ctx.body = ''
})

router.post('/save/:dirname', function (ctx) {
  // Save the description
  writeFileSync(join('objects', ctx.params.dirname, 'description.txt'), ctx.request.body.description)
  // Save the data.json
  writeFileSync(
    join('objects', ctx.params.dirname, 'data.json'),
    JSON.stringify(
      (({description, ...o}) => o)(ctx.request.body),
      null,
      2
    )
  )
  ctx.body = ''
})

router.post('/create/:dirname', function (ctx) {
  mkdirSync(join('objects', ctx.params.dirname))
  ctx.body = ''
})

router.get('/open/:dirname', async function (ctx) {
  const path = join('objects', ctx.params.dirname, 'img')
  // console.log(path)
  // await open(path)
  await open(path, { app: { name: 'Explorer' }})
  // open(`.\\objects\\${ctx.params.dirname}\\img`)
  ctx.body = ''
})

router.post('/remove/:dirname', function (ctx) {
  rmSync(join('objects', ctx.params.dirname), { recursive: true, force: true })
  ctx.body = ''
})

app.use(router.routes()).use(router.allowedMethods())
app.use(KoaStatic('.'))

app.listen(8005, () => {
  console.log(`
  ====================================
  =             BONCOIN              =
  ====================================
  Listening on http://localhost:8005/`)
  open('http://localhost:8005/')
})