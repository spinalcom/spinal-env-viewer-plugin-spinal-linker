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

import Vuex from "vuex";
import Vue from 'vue';
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import {
  OPTION_CONTEXT_INFO,
  OPTION_SELECTED_NODE_INFO
} from "spinal-env-viewer-plugin-graph-manager-vue/src/config";

Vue.use( Vuex );

function initialState() {
  return {
    activeNodesId: [],
    sync: [],
    selectedNode: {},
    inspectedNode: {},
    inspectedNodeName: '',
    inspectedChildren: [],
    refreshed: false,
    childrenPull: [],
    contextsId: [],
    relationNames: [],
    inspectedNodeId: "",
    relationName: '',
    relationType: '',
    activeNode: {},
    nodes: {},
  };
}

let store = new Vuex.Store( {
  
  state: initialState(),
  
  mutations: {
    /*********************/
    /* GRAPH VIEWER INIT */
    /*********************/
    ADD_CONTEXT: ( state, context ) => {
      const contextId = context.id.get();
      if (state.contextId.includes( contextId )) {
        state.contextId.push( contextId );
        if (!state.nodes.hasOwnProperty( contextId )) {
          state.nodes[contextId] = context;
        }
      }
    },
    ADD_CONTEXTS: ( state, contexts ) => {
      
      for (let i = 0; i < contexts.length; i++) {
        const contextId = contexts[i].id.get();
        
        if (!state.contextsId.includes( contextId )) {
          state.contextsId.push( contextId );
        }
        if (!state.nodes.hasOwnProperty( contextId )) {
          state.nodes[contextId] = contexts[i];
        }
      }
    },
    
    
    /******************************/
    /* SPINAL LINKER MAIN FEATURE */
    /******************************/
    LINK_NODE: ( state ) => {
      SpinalGraphService
        .addChild(
          state.inspectedNodeId, state.activeNodesId[0],
          state.relationName, state.relationType )
        .then( () => console.log( 'active', state.activeNodesId[0] ) );
    },
    
    UNLINK_NODE: ( state, childId ) => {
      if (state.nodes.hasOwnProperty( state.inspectedNodeId ) && state.nodes.hasOwnProperty( childId )) {
        state.nodes[state.inspectedNodeId].removeChild( state.nodes[childId], state.relationName, state.relationType );
      }
    },
    
    REMOVE_FROM_GRAPH: ( state, id ) => {
      SpinalGraphService.removeFromGraph( id );
      
    },
    
    INIT: ( state, option ) => {
      for (let key in option) {
        if (option.hasOwnProperty( key ) && state.hasOwnProperty( key )) {
          state[key] = option[key];
        }
      }
    },
    
    
    /*******************************/
    /* SPINAL LINKER CONFIGURATION */
    /*******************************/
    SET_RELATION_TYPE: ( state, relationType ) => {
      state.relationType = relationType;
    },
    
    SET_RELATION_NAME: ( state, relationName ) => {
      state.relationName = relationName;
    },
    
    SET_INSPECTED_NODE: ( state, inspectedNode ) => {
      state.inspectedNodeId = inspectedNode.id.get();
      state.inspectedNode = inspectedNode;
      state.inspectedNodeName = inspectedNode.name.get();
      const relationNames = SpinalGraphService.getRelationNames( state.inspectedNodeId );
      for (let i = 0; i < state.relationNames.length; i++) {
        state.relationNames.pop();
      }
      for (let i = 0; i < relationNames.length; i++) {
        state.relationNames.push( relationNames[i] );
      }
      
    },
    
    SET_ACTIVE_NODE: ( state, activeNode ) => {
      state.activeNodesId = [activeNode];
    },
  
    ADD_NODE: ( state, node ) => {
      if (typeof node !== "undefined" && !state.nodes.hasOwnProperty( node.id.get() )) {
        state.nodes[node.id.get()] = node;
      }
    },
    ADD_NODES: ( state, nodes ) => {
      for (const key in nodes){
        if (nodes.hasOwnProperty( key )) {
          state.nodes[key] = SpinalGraphService.getNode(key);
        }
      }
    
    },
    
    SET_GLOBAL_BAR: ( state, bts ) => {
      const buttons = [];
      for (let i = 0; i < bts.length; i++) {
        let button = bts[i];
        if (button.hasOwnProperty( 'buttonCfg' )) {
          let butcfg = button.buttonCfg;
          butcfg.toolTip = button.label;
          butcfg.action = button.action;
          buttons.push( {
            button: butcfg,
            badge_content: button.badgeCfg
          } );
        }
      }
      state.topBarButton = buttons;
    },
    
    SET_GRAPH: ( state, graph ) => {
      state.graph = graph;
    },
    
    SET_NODE: ( state, node ) => {
      if (typeof node !== "undefined") {
        state.nodes[node.id.get()] = node;
        
      }
    },
    REMOVE_NODE: ( state, id ) => {
      if (state.nodes.hasOwnProperty( id )) {
        state.childrenIds.splice( state.childrenIds.indexOf( id ), 1 );
        delete state.nodes[id];
      }
    },
    ADD_PARENT( state, nodeId ) {
      state.childrenPull.push( nodeId );
    },
    
    
    SET_INSPECTED_CHILDREN: ( state, children ) => {
      for (let i = 0; i < state.inspectedChildren.length; i++) {
        state.inspectedChildren.pop();
      }
      for (let i = 0; i < children.length; i++) {
        state.inspectedChildren.push( children[i] );
      }
    },
    
  },
  getters: {
    hasChildInContext: ( state ) => ( id, contextsId ) => {
      return SpinalGraphService.hasChildInContext( id, contextsId );
    }
  },
  actions: {
    onNodeSelected( context, event ) {
      const option = {};
      option[OPTION_SELECTED_NODE_INFO] = context.state.nodes[event.nodeId];
      option[OPTION_CONTEXT_INFO] = context.state.nodes[event.contextId];
      context.commit( "SET_ACTIVE_NODE", event.nodeId );
    },
    getChildren( context, relationName ) {
      SpinalGraphService.getChildren( context.state.inspectedNodeId, [relationName] )
        .then( children => {
          context.commit( 'SET_INSPECTED_CHILDREN', children );
        } );
    }
  }
  
} );

export default store;