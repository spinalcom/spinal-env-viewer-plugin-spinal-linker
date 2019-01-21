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
import store from "./src/store";
import Vue from 'vue';
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

const extentions = SpinalForgeExtention.createExtention( {
  name: "plugin-spinal-linker",
  vueMountComponent: Vue.extend( {
    render: h => h( SpinalLinker ),
    methods: {
      opened: function ( option ) {
        store.commit( 'SET_RELATION_NAME', option.relationName );
        store.commit( 'SET_RELATION_TYPE', option.relationType );
        store.commit( 'SET_INSPECTED_NODE', option.selectedNode );
        store.dispatch( 'getChildren', option.relationName );
  
        store.commit( 'ADD_NODES', SpinalGraphService.getNodes() );
        const graphId = SpinalGraphService.getGraph().info.id.get();
        SpinalGraphService.getChildren( graphId, [] ).then( children => {
          store.commit( 'ADD_CONTEXTS', children );
        } );


      },
      closed: function () {

      },
      removed: function () {
      }
    },
    store
  } ),

  panel: {
    title: "Spinal Linker",
    className: "plugin-spinal-linker",
    closeBehaviour: "delete"
  },
  style: {
    height: '80vh',
    width: '780px',
    top: '0px',
    left: '427px'
  }
} );

SpinalForgeExtention.registerExtention( "plugin-spinal-linker", extentions );
