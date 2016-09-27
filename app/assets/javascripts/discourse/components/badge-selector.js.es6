import { on, default as computed } from 'ember-addons/ember-computed-decorators';

export default Ember.Component.extend({
  @computed('placeholderKey')
  placeholder(placeholderKey) {
    return placeholderKey ? I18n.t(placeholderKey) : '';
  },

  @on('didInsertElement')
  _initializeAutocomplete() {
    var self = this;
    var selectedBadges;

    var template = this.container.lookup('template:badge-selector-autocomplete.raw');
    self.$('input').autocomplete({
      allowAny: false,
      items: this.get('badgeNames'),
      single: this.get('single'),
      onChangeItems: function(items){
        selectedBadges = items;
        self.set("badgeNames", items.join(","));
      },
      transformComplete: function(g) {
        return g.name;
      },
      dataSource: function(term) {
        return self.get("badgeFinder")(term).then(function(badges){

          if(!selectedBadges){
            return badges;
          }

          return badges.filter(function(badge){
            return !selectedBadges.any(function(s){return s === badge.name;});
          });
        });
      },
      template: template
    });
  }
});
