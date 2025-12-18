<!--
Copyright 2025 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->
<template>
  <div>
    <v-dialog
      class="plugin-spinal-linker-dialog"
      dark
      attach="body"
      v-model="dialog"
    >
      <template v-slot:activator="{ on }">
        <v-layout
          align-center
          justify-space-around
          row
          fill-height
          class="plugin-spinal-linker-legend"
          v-on="on"
        >
          <div class="elevation-5 plugin-spinal-linker-legend-item">
            <v-icon small>link</v-icon> Not Linked
          </div>
          <div class="elevation-5 plugin-spinal-linker-legend-item">
            <v-icon small color="red">link_off</v-icon> in context ({{
              idsIncontextLinked.length
            }})
          </div>
          <div class="elevation-5 plugin-spinal-linker-legend-item">
            <v-icon small color="orange">link_off</v-icon> not in context ({{
              idsLinked.length
            }})
          </div>
        </v-layout>
      </template>

      <v-card class="plugin-spinal-linker-dialog-card">
        <v-card-title class="headline" primary-title>
          Linked items
        </v-card-title>

        <v-card-text>
          <div
            v-if="
              idsLinkedComputed.length === 0 &&
              idsIncontextLinkedComputed.length === 0
            "
          >
            No linked items
          </div>
          <v-list dense>
            <v-subheader v-if="idsIncontextLinkedComputed.length > 0">
              In context ({{ idsIncontextLinkedComputed.length }})
            </v-subheader>
            <v-list-tile
              v-for="item in idsIncontextLinkedComputed"
              :key="item.id"
            >
              <v-list-tile-action>
                <v-checkbox v-model="item.selected"></v-checkbox>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                <v-list-tile-sub-title>ID: {{ item.id }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <!-- not in context -->
            <v-subheader v-if="idsLinkedComputed.length > 0">
              Not in context ({{ idsLinkedComputed.length }})
            </v-subheader>
            <v-list-tile v-for="item in idsLinkedComputed" :key="item.id">
              <v-list-tile-action>
                <v-checkbox v-model="item.selected"></v-checkbox>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                <v-list-tile-sub-title>ID: {{ item.id }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            text
            @click="selectAllInContext"
            v-if="idsIncontextLinkedComputed.length > 0"
          >
            Select all in context
          </v-btn>
          <v-btn
            text
            @click="selectAllNotInContext"
            v-if="idsLinkedComputed.length > 0"
          >
            Select all not in context
          </v-btn>

          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false"> close </v-btn>
          <v-btn text :disabled="!canUnlink" @click="unlinkNodes">
            unlink selection
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'SpinalLinkerDialogShowItems',
  data() {
    return {
      loading: true,
      dialog: false,
      idsLinkedComputed: [],
      idsIncontextLinkedComputed: [],
    };
  },
  props: {
    idsLinked: {
      type: Array,
      required: true,
    },
    idsIncontextLinked: {
      type: Array,
      required: true,
    },
  },
  computed: {
    canUnlink() {
      let can = false;
      this.idsLinkedComputed.forEach((item) => {
        if (item.selected) can = true;
      });
      this.idsIncontextLinkedComputed.forEach((item) => {
        if (item.selected) can = true;
      });
      return can;
    },
  },
  methods: {
    unlinkNodes() {
      const idsToUnlink = [];
      this.idsLinkedComputed.forEach((item) => {
        if (item.selected) idsToUnlink.push(item.id);
      });
      this.idsIncontextLinkedComputed.forEach((item) => {
        if (item.selected) idsToUnlink.push(item.id);
      });
      this.$emit('unlink-nodes', idsToUnlink);
      this.dialog = false;
    },
    selectAllInContext() {
      this.idsIncontextLinkedComputed.forEach((item) => {
        item.selected = true;
      });
    },
    selectAllNotInContext() {
      this.idsLinkedComputed.forEach((item) => {
        item.selected = true;
      });
    },
  },
  watch: {
    idsLinked: {
      immediate: true,
      handler(newVal) {
        this.idsLinkedComputed = newVal.map((id) => {
          const item = FileSystem._objects[id];
          return {
            id: id,
            name: item?.info?.name?.get() || 'unknown',
            selected: false,
          };
        });
      },
    },
    idsIncontextLinked: {
      immediate: true,
      handler(newVal) {
        this.idsIncontextLinkedComputed = newVal.map((id) => {
          const item = FileSystem._objects[id];
          return {
            id: id,
            name: item?.info?.name?.get() || 'unknown',
            selected: false,
          };
        });
      },
    },
  },
};
</script>

<style scoped>
.plugin-spinal-linker-legend {
  cursor: pointer;
  background-color: #212121;
  height: 35px;
}
.plugin-spinal-linker-legend:hover {
  background-color: #333333;
}
</style>
