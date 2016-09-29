import { on, observes, default as computed } from 'ember-addons/ember-computed-decorators';

export default Ember.Component.extend({
  @computed('placeholderKey')
  placeholder(placeholderKey) {
    return placeholderKey ? I18n.t(placeholderKey) : '';
  },

  @observes('groupNames')
  _update() {
    this._initializeAutocomplete({updateData: true});
  },

  @on('didInsertElement')
  _initializeAutocomplete(opts) {
    var self = this;
    var selectedGroups;

    var template = this.container.lookup('template:group-selector-autocomplete.raw');
    self.$('input').autocomplete({
      allowAny: false,
      items: _.isArray(this.get('groupNames')) ? this.get('groupNames') : [this.get('groupNames')],
      single: this.get('single'),
      updateData: (opts && opts.updateData) ? opts.updateData : false,
      onChangeItems: function(items){
        selectedGroups = items;
        self.set("groupNames", items.join(","));
      },
      transformComplete: function(g) {
        return g.name;
      },
      dataSource: function(term) {
        return self.get("groupFinder")(term).then(function(groups){

          if(!selectedGroups){
            return groups;
          }

          return groups.filter(function(group){
            return !selectedGroups.any(function(s){return s === group.name;});
          });
        });
      },
      template: template
    });
  }
});
