export const QB = {
  dsa: [
    { q: 'What is the worst-case time complexity of QuickSort?', opts: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], a: 1, exp: 'Worst case occurs when the pivot is always the min/max element. O(n²). Randomised pivot or 3-way partition mitigates this.' },
    { q: 'Which data structure implements a Priority Queue most efficiently?', opts: ['Array', 'Linked List', 'Binary Heap', 'Stack'], a: 2, exp: 'Binary Heap gives O(log n) insert and O(log n) delete — optimal for priority queues.' },
    { q: 'What is the space complexity of DFS on a graph with V vertices?', opts: ['O(V+E)', 'O(V)', 'O(E)', 'O(1)'], a: 1, exp: 'DFS call stack can grow to O(V) depth; visited array also O(V).' },
    { q: 'Inorder traversal of a BST yields elements in:', opts: ['Reverse order', 'Sorted ascending', 'Random order', 'Level order'], a: 1, exp: 'Inorder (Left→Root→Right) visits BST nodes in ascending sorted order.' },
    { q: 'Time complexity of building a Binary Heap from n elements?', opts: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], a: 2, exp: 'Heapify-down from the last non-leaf node runs in O(n) total — a classic amortized result.' },
    { q: 'What does a Trie primarily optimize?', opts: ['Integer sorting', 'String prefix search', 'Graph traversal', 'Arithmetic ops'], a: 1, exp: 'Tries give O(m) lookup (m=string length) regardless of dictionary size — ideal for autocomplete.' },
    { q: 'Floyd-Warshall algorithm solves:', opts: ['Single-source shortest path', 'All-pairs shortest path', 'Only negative edges', 'Unweighted graphs'], a: 1, exp: 'Floyd-Warshall computes all-pairs shortest paths in O(V³) using dynamic programming.' },
    { q: 'Worst-case lookup time in a Hash Table?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], a: 2, exp: 'If all keys hash to the same bucket (collision storm), lookup degrades to O(n). Average is O(1).' },
    { q: 'Which sort is stable AND guaranteed O(n log n) worst case?', opts: ['Quick Sort', 'Heap Sort', 'Merge Sort', 'Shell Sort'], a: 2, exp: 'Merge Sort is both stable and guarantees O(n log n) in all cases.' },
    { q: 'BFS vs DFS — key difference:', opts: ['BFS uses a stack', 'BFS uses queue, explores level by level', 'DFS is always faster', 'DFS uses less memory'], a: 1, exp: 'BFS uses a queue (FIFO) and explores all neighbours at current depth before going deeper.' },
  ],
  aptitude: [
    { q: 'A train travels 360 km in 4 hours. Time to travel 540 km at the same speed?', opts: ['5 hours', '6 hours', '5.5 hours', '7 hours'], a: 1, exp: 'Speed = 90 km/h. Time = 540÷90 = 6 hours.' },
    { q: 'Odd one out: 2, 3, 5, 7, 11, 14, 17', opts: ['11', '14', '17', '5'], a: 1, exp: 'All others are prime. 14 = 2×7 is composite.' },
    { q: 'A completes job in 12 days, B in 18 days. Together?', opts: ['7.2 days', '6.8 days', '8 days', '7 days'], a: 0, exp: 'Combined rate = 1/12+1/18 = 5/36 per day. Time = 36/5 = 7.2 days.' },
    { q: 'Next in sequence: 1, 4, 9, 16, 25, ?', opts: ['30', '35', '36', '34'], a: 2, exp: 'Perfect squares: 1²,2²,...,5². Next = 6² = 36.' },
    { q: 'MANGO → OCPIQ. How is APPLE coded?', opts: ['CRRNG', 'CRRNF', 'DRRNG', 'CQQNG'], a: 0, exp: 'Each letter shifts +2: A→C,P→R,P→R,L→N,E→G = CRRNG.' },
  ],
  system: [
    { q: 'Which consistency model does Apache Cassandra use by default?', opts: ['Strong', 'Eventual', 'Causal', 'Linear'], a: 1, exp: 'Cassandra defaults to eventual consistency for high availability, tunable per-operation.' },
    { q: 'CAP theorem: under network partition you must choose:', opts: ['CA', 'CP or AP', 'All three', 'None'], a: 1, exp: 'Under partition: CP (Consistency + Partition) or AP (Availability + Partition). CA is impossible.' },
    { q: 'Primary purpose of a CDN?', opts: ['DB caching', 'Reduced latency via edge servers', 'Load balancing only', 'Security only'], a: 1, exp: 'CDNs serve content from geographically distributed edge nodes, reducing latency.' },
  ],
  verbal: [
    { q: 'Antonym of GREGARIOUS:', opts: ['Sociable', 'Reclusive', 'Talkative', 'Vibrant'], a: 1, exp: 'Gregarious = fond of company. Antonym: Reclusive.' },
    { q: '"The pen is mightier than the sword" — literary device?', opts: ['Simile', 'Metaphor', 'Personification', 'Alliteration'], a: 1, exp: 'A metaphor compares pen (ideas) to sword (force) without using "like/as".' },
    { q: 'Grammatically correct:', opts: ['Neither of the students have submitted', 'Neither of the students has submitted', 'Neither student have submitted', 'All are correct'], a: 1, exp: '"Neither" takes singular verb "has".' },
  ],
}

export const IVQ = {
  technical: [
    'How would you implement an LRU Cache? What data structures and why?',
    'Explain the differences between TCP and UDP. When would you choose each?',
    'How does garbage collection work in Java? Describe different GC algorithms.',
    'Design a URL shortener like bit.ly at scale — walk me through your architecture.',
    'What is the difference between a process and a thread? How does context switching work?',
  ],
  hr: [
    'Tell me about yourself and why you want this role.',
    'Describe a challenging project and how you overcame the obstacles.',
    'Where do you see yourself in 5 years?',
    'Tell me about a conflict with a teammate and how you resolved it.',
    'What is your biggest technical weakness and how are you improving it?',
  ],
  system: [
    'Design a distributed key-value store like Redis at 1M req/s.',
    "Design Twitter's newsfeed for a read-heavy system at scale.",
    'Design a real-time collaborative document editor like Google Docs.',
  ],
}

export const INTERNS = [
  { co: 'Google', role: 'Software Engineer Intern', loc: 'Bangalore, IN', dur: '3 Months', domain: 'swe', match: 94, dl: 'Mar 31, 2026', tags: ['React', 'Python', 'Distributed Sys'], color: '#4285f4', letter: 'G', badge: 'bg', isNew: true, desc: 'Build product-facing web features with scalable frontend architecture and backend integration support.' },
  { co: 'Microsoft', role: 'ML Research Intern', loc: 'Hyderabad, IN', dur: '6 Months', domain: 'ml', match: 89, dl: 'Apr 15, 2026', tags: ['PyTorch', 'NLP', 'Azure'], color: '#00a4ef', letter: 'M', badge: 'bb', isNew: false, desc: 'Work with research engineers on model prototyping, experiment tracking, and responsible AI benchmarks.' },
  { co: 'Flipkart', role: 'Data Engineering Intern', loc: 'Bangalore, IN', dur: '3 Months', domain: 'data', match: 85, dl: 'Apr 30, 2026', tags: ['Spark', 'SQL', 'Kafka'], color: '#f7a828', letter: 'F', badge: 'by', isNew: false, desc: 'Develop ETL pipelines for commerce analytics and improve reliability of batch and streaming workflows.' },
  { co: 'Amazon', role: 'Backend Developer Intern', loc: 'Hyderabad, IN', dur: '6 Months', domain: 'backend', match: 81, dl: 'May 10, 2026', tags: ['Java', 'AWS', 'Microservices'], color: '#ff9900', letter: 'A', badge: 'by', isNew: true, desc: 'Implement microservice APIs, optimize latency, and contribute to cloud-native backend deployments.' },
  { co: 'Razorpay', role: 'SDE Intern', loc: 'Bangalore, IN', dur: '4 Months', domain: 'backend', match: 78, dl: 'Apr 20, 2026', tags: ['Node.js', 'Go', 'PostgreSQL'], color: '#2eb8e6', letter: 'R', badge: 'bb', isNew: false, desc: 'Build secure payment platform services with strong focus on reliability, observability, and API quality.' },
  { co: 'Zomato', role: 'Data Science Intern', loc: 'Gurugram, IN', dur: '3 Months', domain: 'data', match: 74, dl: 'Apr 25, 2026', tags: ['Python', 'ML', 'SQL'], color: '#e23744', letter: 'Z', badge: 'br', isNew: false, desc: 'Support demand forecasting and recommendation models using experimentation and production data insights.' },
  { co: 'Swiggy', role: 'Frontend Developer Intern', loc: 'Bangalore, IN', dur: '3 Months', domain: 'frontend', match: 72, dl: 'May 5, 2026', tags: ['React', 'TypeScript', 'CSS'], color: '#fc8019', letter: 'S', badge: 'br', isNew: false, desc: 'Create responsive user interfaces and improve developer experience for high-scale consumer products.' },
  { co: 'Meesho', role: 'ML Intern', loc: 'Bangalore, IN', dur: '4 Months', domain: 'ml', match: 69, dl: 'May 15, 2026', tags: ['TensorFlow', 'Python', 'MLOps'], color: '#9c3587', letter: 'M', badge: 'bp', isNew: false, desc: 'Assist in training and monitoring ML models focused on catalog intelligence and ranking quality.' },
]
