import { on, observes, default as computed } from 'ember-addons/ember-computed-decorators';

export default Em.Component.extend({
  tagName: 'div',
  classNames: ['search-advanced', 'row'],
  searchedTerms: {username: [], category: [], group: [], badge: [], tags: [],
    in: '', status: '', posts_count: '', time: {when: 'before', days: ''}},
  inOptions: [
    {name: I18n.t('search.advanced.filters.likes'),     value: "likes"},
    {name: I18n.t('search.advanced.filters.posted'),    value: "posted"},
    {name: I18n.t('search.advanced.filters.watching'),  value: "watching"},
    {name: I18n.t('search.advanced.filters.tracking'),  value: "tracking"},
    {name: I18n.t('search.advanced.filters.private'),   value: "private"},
    {name: I18n.t('search.advanced.filters.bookmarks'), value: "bookmarks"},
    {name: I18n.t('search.advanced.filters.first'),     value: "first"},
    {name: I18n.t('search.advanced.filters.pinned'),    value: "pinned"},
    {name: I18n.t('search.advanced.filters.unpinned'),  value: "unpinned"},
    {name: I18n.t('search.advanced.filters.wiki'),      value: "wiki"}
  ],
  statusOptions: [
    {name: I18n.t('search.advanced.statuses.open'),        value: "open"},
    {name: I18n.t('search.advanced.statuses.closed'),      value: "closed"},
    {name: I18n.t('search.advanced.statuses.archived'),    value: "archived"},
    {name: I18n.t('search.advanced.statuses.noreplies'),   value: "noreplies"},
    {name: I18n.t('search.advanced.statuses.single_user'), value: "single_user"},
  ],
  postTimeOptions: [
    {name: I18n.t('search.advanced.post.time.before'),  value: "before"},
    {name: I18n.t('search.advanced.post.time.after'),   value: "after"}
  ],

  @on('init')
  @observes('searchTerm')
  _init() {
    const searchTerm = this.get('searchTerm');

    if (!searchTerm)
      return;

    const userMatches = searchTerm.match(/(\@[a-zA-Z0-9_\-.]+|user:[a-zA-Z0-9_\-.]+)/ig);
    if (userMatches) {
      this.set('searchedTerms.username', [userMatches[0].replace('user:', '').replace('@', '')]);
    } else
      this.set('searchedTerms.username', []);

    const categoryMatches = searchTerm.match(/(\#[a-zA-Z0-9\-:]+|category:[a-zA-Z0-9\-:]+)/ig);
    if (categoryMatches) {
      const subcategories = categoryMatches[0].replace('category:', '').replace('#', '').split(':');
      if (subcategories.length > 1)
        this.set('searchedTerms.category', [Discourse.Category.findBySlug(subcategories[1], subcategories[0])]);
      else
        if (isNaN(subcategories))
          this.set('searchedTerms.category', [Discourse.Category.findSingleBySlug(subcategories[0])]);
        else
          this.set('searchedTerms.category', [Discourse.Category.findById(subcategories[0])]);
    } else
      this.set('searchedTerms.category', []);

    const groupMatches = searchTerm.match(/(group:[a-zA-Z0-9_\-.]+)/ig);
    if (groupMatches)
      this.set('searchedTerms.group', [groupMatches[0].replace('group:', '')]);
    else
      this.set('searchedTerms.group', []);

    const badgeMatches = searchTerm.match(/(badge:[a-zA-Z0-9_\-.]+)/ig);
    if (badgeMatches)
      this.set('searchedTerms.badge', [badgeMatches[0].replace('badge:', '')]);
    else
      this.set('searchedTerms.badge', []);

    const tagMatches = searchTerm.match(/(tags?:[a-zA-Z0-9,\-_]+)/ig);
    if (tagMatches)
      this.set('searchedTerms.tags', tagMatches[0].replace(/tags?:/ig, '').split(','));
    else
      this.set('searchedTerms.tags', []);

    const inMatches = searchTerm.match(/(in:[a-zA-Z]+)/ig);
    if (inMatches)
      this.set('searchedTerms.in', inMatches[0].replace('in:', ''));
    else
      this.set('searchedTerms.in', '');

    const statusMatches = searchTerm.match(/(status:[a-zA-Z_]+)/ig);
    if (statusMatches)
      this.set('searchedTerms.status', statusMatches[0].replace('status:', ''));
    else
      this.set('searchedTerms.status', '');

    const postCountMatches = searchTerm.match(/(posts_count:[0-9]+)/ig);
    if (postCountMatches)
      this.set('searchedTerms.posts_count', postCountMatches[0].replace('posts_count:', ''));
    else
      this.set('searchedTerms.posts_count', '');

    const postTimeMatches = searchTerm.match(/((before|after):[0-9\-]+)/ig);
    if (postTimeMatches) {
      this.set('searchedTerms.time.when', postTimeMatches[0].match(/(before|after)/ig)[0]);
      this.set('searchedTerms.time.days', postTimeMatches[0].replace(/(before|after):/ig, ''));
    } else
      this.set('searchedTerms.time.days', '');
  },

  @observes('searchedTerms.username')
  updateUsername() {
    let searchTerm = this.get('searchTerm');

    const userMatches = searchTerm.match(/\s?(\@[a-zA-Z0-9_\-.]+|user:[a-zA-Z0-9_\-.]+)/ig);
    const userFilter = this.get('searchedTerms.username');
    if (userFilter && userFilter.length !== 0)
      if (userMatches)
        searchTerm = searchTerm.replace(userMatches[0], ' user:' + userFilter);
      else
        searchTerm += ' user:' + userFilter;
    else if (userMatches)
      searchTerm = searchTerm.replace(userMatches[0], '');

    this.set('searchTerm', searchTerm);
  },

  @observes('searchedTerms.category')
  updateCategory() {
    let searchTerm = this.get('searchTerm');

    const categoryMatches = searchTerm.match(/\s?(\#[a-zA-Z0-9\-:]+|category:[a-zA-Z0-9\-:]+)/ig);
    const categoryFilter = this.get('searchedTerms.category');
    if (categoryFilter && categoryFilter.length !== 0) {
      if (categoryMatches)
        searchTerm = searchTerm.replace(categoryMatches[0], ' category:' + categoryFilter[0].id);
      else
        searchTerm += ' category:' + categoryFilter[0].id;
    } else if (categoryMatches)
      searchTerm = searchTerm.replace(categoryMatches[0], '');

    this.set('searchTerm', searchTerm);
  },

  @observes('searchedTerms.group')
  updateGroup() {
    let searchTerm = this.get('searchTerm');

    const groupMatches = searchTerm.match(/\s?(group:[a-zA-Z0-9_\-.]+)/ig);
    const groupFilter = this.get('searchedTerms.group');
    if (groupFilter && groupFilter.length !== 0)
      if (groupMatches)
        searchTerm = searchTerm.replace(groupMatches[0], ' group:' + groupFilter);
      else
        searchTerm += ' group:' + groupFilter;
    else if (groupMatches)
      searchTerm = searchTerm.replace(groupMatches[0], '');

    this.set('searchTerm', searchTerm);
  },

  @observes('searchedTerms.badge')
  updateBadge() {
    let searchTerm = this.get('searchTerm');

    const badgeMatches = searchTerm.match(/\s?(badge:[a-zA-Z0-9_\-.]+)/ig);
    const badgeFilter = this.get('searchedTerms.badge');
    if (badgeFilter && badgeFilter.length !== 0)
      if (badgeMatches)
        searchTerm = searchTerm.replace(badgeMatches[0], ' badge:' + badgeFilter);
      else
        searchTerm += ' badge:' + badgeFilter;
    else if (badgeMatches)
      searchTerm = searchTerm.replace(badgeMatches[0], '');

    this.set('searchTerm', searchTerm);
  },

  @observes('searchedTerms.tags')
  updateTags() {
    let searchTerm = this.get('searchTerm');

    const tagMatches = searchTerm.match(/\s?(tags?:[a-zA-Z0-9,\-_]+)/ig);
    const tagFilter = this.get('searchedTerms.tags');
    if (tagFilter && tagFilter.length !== 0)
      if (tagMatches)
        searchTerm = searchTerm.replace(tagMatches[0], ' tags:' + tagFilter.join(','));
      else
        searchTerm += ' tags:' + tagFilter.join(',');
    else if (tagMatches)
      searchTerm = searchTerm.replace(tagMatches[0], '');

    this.set('searchTerm', searchTerm);
  },

  @observes('searchedTerms.in')
  updateIn() {
    let searchTerm = this.get('searchTerm');

    const inMatches = searchTerm.match(/\s?(in:[a-zA-Z]+)/ig);
    const inFilter = this.get('searchedTerms.in');
    if (inFilter)
      if (inMatches)
        searchTerm = searchTerm.replace(inMatches[0], ' in:' + inFilter);
      else
        searchTerm += ' in:' + inFilter;
    else if (inMatches)
      searchTerm = searchTerm.replace(inMatches[0], '');

    this.set('searchTerm', searchTerm);
  },

  @observes('searchedTerms.status')
  updateStatus() {
    let searchTerm = this.get('searchTerm');

    const statusMatches = searchTerm.match(/\s?(status:[a-zA-Z_]+)/ig);
    const statusFilter = this.get('searchedTerms.status');
    if (statusFilter)
      if (statusMatches)
        searchTerm = searchTerm.replace(statusMatches[0], ' status:' + statusFilter);
      else
        searchTerm += ' status:' + statusFilter;
    else if (statusMatches)
      searchTerm = searchTerm.replace(statusMatches[0], '');

    this.set('searchTerm', searchTerm);
  },

  @observes('searchedTerms.posts_count')
  updatePostsCount() {
    let searchTerm = this.get('searchTerm');

    const postCountMatches = searchTerm.match(/\s?(posts_count:[0-9]+)/ig);
    const postsCountFilter = this.get('searchedTerms.posts_count');
    if (postsCountFilter)
      if (postCountMatches)
        searchTerm = searchTerm.replace(postCountMatches[0], ' posts_count:' + postsCountFilter);
      else
        searchTerm += ' posts_count:' + postsCountFilter;
    else if (postCountMatches)
      searchTerm = searchTerm.replace(postCountMatches[0], '');

    this.set('searchTerm', searchTerm);
  },

  @observes('searchedTerms.time.when', 'searchedTerms.time.days')
  updatePostTime() {
    let searchTerm = this.get('searchTerm');

    const postTimeMatches = searchTerm.match(/\s?((before|after):[0-9\-]+)/ig);
    const timeDaysFilter = this.get('searchedTerms.time.days');
    if (timeDaysFilter)
      if (postTimeMatches)
        searchTerm = searchTerm.replace(postTimeMatches[0], ' ' + this.get('searchedTerms.time.when') + ':' + timeDaysFilter);
      else
        searchTerm += ' ' + this.get('searchedTerms.time.when') + ':' + timeDaysFilter;
    else if (postTimeMatches)
      searchTerm = searchTerm.replace(postTimeMatches[0], '');

    this.set('searchTerm', searchTerm);
  },

  groupFinder(term) {
    const Group = require('discourse/models/group').default;
    return Group.findAll({search: term, ignore_automatic: false});
  },

  badgeFinder(term) {
    const Badge = require('discourse/models/badge').default;
    return Badge.findAll({search: term});
  },

  collapsedClassName: function() {
    return (this.get('isExpanded')) ? "fa-caret-down" : "fa-caret-right";
  }.property('isExpanded'),

  @computed('isExpanded')
  isCollapsed(isExpanded){
    return !isExpanded;
  },

  actions: {
    expandOptions() {
      this.set('isExpanded', !this.get('isExpanded'));
      if (this.get('isExpanded'))
        this._init();
    }
  }
});
