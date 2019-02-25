/*
 * Copyright 2019 SpinalCom - www.spinalcom.com
 *
 *  This file is part of SpinalCore.
 *
 *  Please read all of the following terms and conditions
 *  of the Free Software license Agreement ("Agreement")
 *  carefully.
 *
 *  This Agreement is a legally binding contract between
 *  the Licensee (as defined below) and SpinalCom that
 *  sets forth the terms and conditions that govern your
 *  use of the Program. By installing and/or using the
 *  Program, you agree to abide by all the terms and
 *  conditions stated or referenced herein.
 *
 *  If you do not agree to abide by these terms and
 *  conditions, do not demonstrate your acceptance and do
 *  not install or use the Program.
 *  You should have received a copy of the license along
 *  with this file. If not, see
 *  <http://resources.spinalcom.com/licenses.pdf>.
 */

import { SpinalForgeExtention } from "spinal-env-viewer-panel-manager-service_spinalforgeextention";
import SpinalLinker from "./src/SpinalLinker.vue";
import "./src/GraphManagerButton/SpinalLinkerButton";

import Vue from 'vue';

import AsyncComputed from 'vue-async-computed'
Vue.use(AsyncComputed);


const extentions = SpinalForgeExtention.createExtention( {
  name: "plugin-spinal-linker",
  vueMountComponent: Vue.extend(  SpinalLinker ),

  panel: {
    title: "Spinal Linker",
    className: "plugin-spinal-linker",
    closeBehaviour: "delete"
  },
  style: {
    height: '80vh',
    width: '360px',
    top: '0px',
    left: '427px'
  }
} );

SpinalForgeExtention.registerExtention( "plugin-spinal-linker", extentions );
