#!/usr/bin/env node

'use strict'

const MainCommand = require('../build/index').MainCommand
const d = new MainCommand()
d.start()
