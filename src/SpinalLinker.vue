<!--
  - Copyright 2019 SpinalCom - www.spinalcom.com
  -
  -  This file is part of SpinalCore.
  -
  -  Please read all of the following terms and conditions
  -  of the Free Software license Agreement ("Agreement")
  -  carefully.
  -
  -  This Agreement is a legally binding contract between
  -  the Licensee (as defined below) and SpinalCom that
  -  sets forth the terms and conditions that govern your
  -  use of the Program. By installing and/or using the
  -  Program, you agree to abide by all the terms and
  -  conditions stated or referenced herein.
  -
  -  If you do not agree to abide by these terms and
  -  conditions, do not demonstrate your acceptance and do
  -  not install or use the Program.
  -  You should have received a copy of the license along
  -  with this file. If not, see
  -  <http://resources.spinalcom.com/licenses.pdf>.
  -->

<template>
  <v-card dark class="plugin-spinal-linker">
    <v-toolbar dark class="plugin-spinal-linker-toolbar">
      <v-toolbar-title v-if="searchOpen === false">
        <h6 v-if="selectId !== contextId">
          {{ contextName }}
        </h6>
        <h4>
          {{ nodeName }}
        </h4>
      </v-toolbar-title>
      <v-toolbar-title v-else>
        <v-text-field
          style="flex-grow: 1"
          v-model="search"
          label="Search"
          dark
          flat
          solo-inverted
          hide-details
        ></v-text-field>
      </v-toolbar-title>
      <v-btn icon @click="onToggleSearch">
        <v-icon>{{ searchOpen ? 'close' : 'search' }}</v-icon>
      </v-btn>
    </v-toolbar>

    <v-layout pa-3 class="plugin-spinal-linker-layout spinal-scrollbar">
      <v-text-field
        v-model="proxyRelationName"
        label="Relation Name"
        dark
        outline
        hide-details
      >
        <template v-slot:append-outer>
          <v-checkbox
            class="plugin-spinal-linker-in-context-checkbox"
            hint="relation in Context"
            v-model="inContextProxy"
            v-tooltip="'Add item in context'"
            label="In Context"
            dark
          ></v-checkbox>
        </template>
        <template v-slot:append>
          <v-btn
            v-if="
              relationName !== proxyRelationName || inContext !== inContextProxy
            "
            class="plugin-spinal-linker-validate-relation-btn"
            :loading="loadingUpdateRelations"
            small
            dark
            @click="reloadWithProxyVal"
            icon
            :disabled="proxyRelationName.length === 0"
          >
            <v-icon>check</v-icon>
          </v-btn>
        </template>
      </v-text-field>

      <v-treeview
        class="plugin-spinal-linker-treeview"
        :items="items"
        :load-children="loadChildren"
        :open.sync="open"
        :search="search"
        item-key="id"
        item-text="name"
        item-children="children"
        open-on-click
        transition
        :hoverable="true"
      >
        <template v-slot:label="{ item }">
          <span class="spinal-linker-label-name" v-tooltip="item.name">{{
            item.name
          }}</span>
        </template>
        <template v-slot:append="{ item }">
          <v-btn
            v-if="item.linkedState === 1"
            icon
            small
            @click.stop="unlinkNode(item)"
            v-tooltip="'Unlink node'"
          >
            <v-icon :color="getColor(item)">link_off</v-icon>
          </v-btn>
          <v-btn
            v-else-if="item.id !== selectId"
            icon
            small
            v-tooltip="'Link node'"
            @click.stop="linkNode(item)"
          >
            <v-icon>link</v-icon>
          </v-btn>
        </template>
      </v-treeview>
    </v-layout>
    <SpinalLinkerDialogShowItems
      :idsLinked="linkedIds.filter((id) => !linkedInContextIds.includes(id))"
      :idsIncontextLinked="linkedInContextIds"
      @unlink-nodes="unlinkNodes"
    ></SpinalLinkerDialogShowItems>
  </v-card>
</template>

<script>
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { FileSystem } from 'spinal-core-connectorjs';
import SpinalLinkerDialogShowItems from './SpinalLinkerDialogShowItems.vue';

export default {
  name: 'SpinalLinker',
  components: { SpinalLinkerDialogShowItems },
  data: function () {
    return {
      selectId: 0,
      contextId: 0,
      relationName: '',
      proxyRelationName: '',
      relationType: '',
      searchOpen: false,
      inContextProxy: false,
      inContext: false,
      search: '',
      items: [],
      open: [],
      linkedIds: [],
      linkedInContextIds: [],
      loadingUpdateRelations: false,
    };
  },
  computed: {
    nodeName: function () {
      if (this.selectId)
        return (
          FileSystem._objects[this.selectId]?.info?.name?.get() || 'undefined'
        );
      return 'undefined';
    },
    contextName: function () {
      if (this.contextId)
        return (
          FileSystem._objects[this.contextId]?.info?.name?.get() || 'undefined'
        );
      return 'undefined';
    },
  },
  methods: {
    getColor(item) {
      if (this.linkedInContextIds.find((id) => id === item.id)) {
        return 'red';
      }
      return 'orange';
    },
    onToggleSearch() {
      this.searchOpen = !this.searchOpen;
      if (!this.searchOpen) {
        this.search = '';
      }
    },
    async reloadWithProxyVal() {
      this.loadingUpdateRelations = true;
      this.relationName = this.proxyRelationName;
      this.inContext = this.inContextProxy;
      const sourceNode = FileSystem._objects[this.selectId];
      const childrenfromRel = await sourceNode.getChildren(
        this.relationName,
        this.relationType
      );
      this.linkedIds = [];
      this.linkedInContextIds = [];
      for (const child of childrenfromRel) {
        this.linkedIds.push(child._server_id);
      }
      const contextNode = FileSystem._objects[this.contextId];
      const childrenInContext = await sourceNode.getChildrenInContext(
        contextNode,
        this.relationName
      );
      for (const child of childrenInContext) {
        if (this.linkedIds.find((id) => id === child._server_id)) {
          this.linkedInContextIds.push(child._server_id);
        }
      }
      this.updateLinkedStates();
      this.loadingUpdateRelations = false;
    },
    updateLinkedStates() {
      const updateState = (item) => {
        if (this.linkedIds.find((id) => id === item.id)) {
          item.linkedState = 1;
        } else {
          item.linkedState = 2;
        }
        if (item.children) {
          item.children.forEach((child) => updateState(child));
        }
      };
      this.items.forEach((item) => updateState(item));
    },
    async linkNode(target) {
      const targetNode = FileSystem._objects[target.id];
      const sourceNode = FileSystem._objects[this.selectId];
      if (this.inContext) {
        const contextNode = FileSystem._objects[this.contextId];
        await sourceNode.addChildInContext(
          targetNode,
          this.relationName,
          this.relationType,
          contextNode
        );
        this.linkedInContextIds.push(targetNode._server_id);
      } else {
        await sourceNode.addChild(
          targetNode,
          this.relationName,
          this.relationType
        );
      }
      target.linkedState = 1;
      this.linkedIds.push(target.id);
    },
    unlinkNode(target) {
      const targetNode = FileSystem._objects[target.id];
      const sourceNode = FileSystem._objects[this.selectId];
      sourceNode.removeChild(targetNode, this.relationName, this.relationType);
      target.linkedState = 2;
      this.linkedIds = this.linkedIds.filter((id) => id !== target.id);
    },
    unlinkNodes(idsToUnlink) {
      const sourceNode = FileSystem._objects[this.selectId];
      idsToUnlink.forEach((id) => {
        const targetNode = FileSystem._objects[id];
        sourceNode.removeChild(
          targetNode,
          this.relationName,
          this.relationType
        );
      });
      this.reloadWithProxyVal();
    },
    createItem(node, context) {
      const item = {
        id: node._server_id,
        name: node.info.name.get(),
        contextId: context._server_id,
        linkedState: 0, //  1: linked, 2: not linked
        children: [],
      };
      if (this.linkedIds.find((id) => id === node._server_id)) {
        item.linkedState = 1;
      } else {
        item.linkedState = 2;
      }
      return item;
    },
    opened: async function (option) {
      this.relationName = option.relationName;
      this.proxyRelationName = option.relationName;
      this.relationType = option.relationType;
      const node = SpinalGraphService.getRealNode(option.selectedNode.id.get());
      const contextNode = SpinalGraphService.getRealNode(
        option.selectedContext.id.get()
      );
      this.selectId = node._server_id;
      this.contextId = contextNode._server_id;
      this.items = [];
      const graph = SpinalGraphService.getGraph();
      const contexts = await graph.getChildren();
      for (const context of contexts) {
        this.items.push(this.createItem(context, context));
      }
      await this.reloadWithProxyVal();
    },
    closed: function () {},
    removed: function () {},
    async loadChildren(item) {
      const node = FileSystem._objects[item.id];
      const context = FileSystem._objects[item.contextId];
      const children = await node?.getChildrenInContext(context);
      const items = children.map((child) => this.createItem(child, context));
      if (items.length === 0) {
        delete item.children;
        return null;
      }
      item.children = items;
      return items;
    },
  },
};
</script>
<style>
.plugin-spinal-linker * {
  box-sizing: border-box;
}
.plugin-spinal-linker .plugin-spinal-linker-toolbar .v-toolbar__content {
  display: flex;
  justify-content: space-between;
}
.plugin-spinal-linker
  .plugin-spinal-linker-layout
  .plugin-spinal-linker-treeview
  .v-treeview-node__label {
  width: 50px;
  overflow: hidden;
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>

<style scoped>
.plugin-spinal-linker {
  width: 100%;
  height: calc(100% - 20px);
  overflow: hidden;
}
.spinal-linker-label-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plugin-spinal-linker-layout {
  height: calc(100% - 99px);
  overflow: auto;
  display: block;
}
.plugin-spinal-linker-in-context-checkbox {
  margin: 0;
}
.plugin-spinal-linker-validate-relation-btn {
  margin: 0;
}
.plugin-spinal-linker-legend-item {
  padding: 2px 8px;
}
.plugin-spinal-linker-legend {
  height: 31px;
}
</style>
