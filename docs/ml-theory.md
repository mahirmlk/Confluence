# Classical ML Algorithms — Theory & Intuition

A practical guide to the algorithms that still power most real-world ML systems, written for humans who want to understand *why* they work, not just *how* to call them.

---

## Algorithm Taxonomy

```
                          Machine Learning
                                │
               ┌────────────────┴────────────────┐
               │                                 │
         Supervised                       Unsupervised
      (learns from labels)            (finds structure)
               │                                 │
     ┌─────────┴─────────┐           ┌───────────┴───────────┐
     │                   │           │                       │
 Classification      Regression   Clustering          Dimensionality
 (predict category)  (predict    (group similar        Reduction
                      number)     things)              (compress)
     │                   │           │                       │
 ┌───┴───┐               │       ┌───┴───┐               ┌───┴───┐
 │       │               │       │       │               │       │
Linear  Non-            KNN    K-Means  DBSCAN         PCA    t-SNE
Model   Linear          │      │                        │      │
 │      │               │      │                        │      │
LR    SVM,Tree,       Vote   Assign                   Eigen   Manifold
      Forest,Boost    nearby → centroids              vectors  learning
```

---

## Why Classical Algorithms Still Matter

Neural networks get all the headlines, but here's the thing: most business data is tabular — rows of customers with columns of attributes, transaction records, sensor readings with labeled outcomes. For this kind of data, classical algorithms often beat deep learning, and they do it with less data, less compute, and way more interpretability.

A bank deciding on a loan doesn't want a black box it can't explain to regulators. A startup with 2,000 training examples can't feed a deep network that needs millions. These older methods aren't training wheels you discard once you learn neural networks. They're the right tool for whole categories of problems.

The algorithms below are grouped by what they do. Most are **supervised** (they learn from labeled examples). Two are **unsupervised** (they find structure in unlabeled data). Throughout, we'll focus on what's genuinely new to each algorithm rather than rebuilding concepts you already know.

---

## 1. Linear Regression

### The Idea

The simplest supervised algorithm there is. Assume the thing you're predicting is roughly a weighted sum of the inputs, then find the weights that fit the data best.

If house price goes up smoothly with square footage, a straight line through the points captures most of the story.

### Visual Intuition

```
    Price ($K)
       │
  500  │                              ·  ·
       │                          · ·  
  400  │                      ·  ·    ← best fit line
       │                  ·  ·         minimizes squared
  300  │              ·  ·             distances to points
       │          ·  ·
  200  │      ·  ·
       │  ·  ·
  100  │·
       │
       └──────────────────────────────────────
         500   1000   1500   2000   2500   3000
                     Square Footage

    Each dot = a house sale
    Line = the model's prediction
    Goal: find the line that minimizes the average squared vertical distance to all dots
```

### The Math

The model is a weighted sum with no activation:

```
ŷ = w₁x₁ + w₂x₂ + ... + wₙxₙ + b
```

Where:
- `xᵢ` are the input features
- `wᵢ` are the weights (how much each feature moves the prediction)
- `b` is the bias (baseline value when all features are zero)
- `ŷ` is the predicted number

With one input this is a line. With many it's a flat sheet — a hyperplane — through higher-dimensional space.

To measure fit, we use **mean squared error**: the average squared gap between predictions and truths. Training means choosing the weights that make that error smallest.

### The Normal Equation

What's special about linear regression is that you don't need gradient descent to find the minimum. The error is a simple quadratic bowl in the weights, so calculus hands you the answer in closed form:

```
θ = (XᵀX)⁻¹Xᵀy
```

Here, `θ` collects all weights and bias into one vector. `X` is the design matrix (each row is one example's features, with an extra column of 1s for the bias). `y` is the column of true target values. The superscript `⁻¹` is the matrix inverse — the matrix equivalent of dividing.

Just as solving `ax = c` for a single number gives `x = c/a`, this formula solves the whole system at once and lands exactly on the weights that minimize squared error, in one step.

### Why Ever Use Gradient Descent?

Because that inverse gets expensive fast as features grow. On large problems we fall back to iterative gradient descent, which crawls to the same answer without forming the inverse.

### Example: Predicting House Prices

You have data on 500 houses: square footage, number of bedrooms, age, and selling price. Linear regression finds weights like:

```
price = 150 × sqft + 20,000 × bedrooms - 1,000 × age + 50,000
```

Now you can predict: a 2,000 sqft, 3-bedroom, 10-year-old house would sell for about $430,000. Each weight is directly interpretable — "each additional bedroom adds about $20,000 to the price."

### When to Use It

- When you suspect a roughly straight-line relationship between features and a continuous target
- As a baseline — always try linear regression first; if something more complex doesn't beat it significantly, stick with linear
- When interpretability matters (you need to explain the model to stakeholders)

---

## 2. Logistic Regression

### The Idea

Despite the name, this is a classification algorithm, not regression. It's the workhorse of binary yes/no prediction in industry.

Take the same weighted sum as linear regression, but instead of reporting it as a raw number, squash it into a probability between 0 and 1, so the output reads as "how likely is this the positive class?"

### Visual Intuition

```
    The Sigmoid Squash
    ──────────────────

    Output                          1.0 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
    (probability)                          ·
                                         ·
                                      ·
                                   ·
                                ·              ← sigmoid turns any number
                             ·                  into a probability 0..1
    0.5 ─ ─ ─ ─ ─ ─ ─ · ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
                       ·
                    ·
                 ·
              ·
           ·
    0.0 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
          -6   -4   -2    0    2    4    6
                     Raw Score (wᵀx + b)


    Decision Boundary in Feature Space
    ───────────────────────────────────

         Feature 2
            │
            │    ○ ○              ● ●
            │  ○ ○ ○           ● ● ●
            │    ○ ○           ● ● ●
            │      ○ ○       ● ● ●
            │─────────────────────────────  ← boundary where score = 0
            │        ○ ○   ● ●
            │          ○ ● ●
            │          ● ●
            │
            └────────────────────────────── Feature 1

         ○ = Class 0 (negative)     ● = Class 1 (positive)
         Line = decision boundary (straight in input space)
```

### The Math

The model applies the sigmoid function to the linear score:

```
P(y=1|x) = σ(wᵀx + b) = 1 / (1 + e^-(wᵀx + b))
```

Reading it:
- `wᵀx + b` is the familiar weighted sum (a single raw score)
- `σ` is the sigmoid that bends any score into the range (0, 1)
- `P(y=1|x)` is read "the probability that the label is 1 given the input x"

We train it with **binary cross-entropy loss**, which rewards the model for putting high probability on the correct answer and punishes confident mistakes.

### Why It's Beloved

**The decision boundary is a straight line.** The model predicts the positive class wherever the raw score `wᵀx + b` is positive, and the boundary sits exactly where that score is zero.

**It's interpretable.** The raw score is the **log-odds** of the positive class:

```
wᵀx + b = log(p / (1-p))
```

Where `p/(1-p)` is the odds (probability of yes divided by probability of no). Each weight tells you exactly how much one unit of its feature shifts the log-odds toward yes or no — the kind of statement you can put in a report and defend.

### Example: Email Spam Detection

You have 10,000 emails labeled as spam or not spam, with features like:
- Number of times "free" appears
- Number of exclamation marks
- Whether the sender is in your contacts
- Email length

Logistic regression learns weights like:

```
spam_score = 2.3 × "free_count" + 0.8 × exclamation_marks - 3.1 × in_contacts + 0.001 × length
```

An email with "free" appearing 5 times, 3 exclamation marks, from a stranger, 500 words long would get a high spam score. The sigmoid converts that to a probability — maybe 94% likely to be spam.

The weight `-3.1` for `in_contacts` means being in your contacts reduces the log-odds of spam by 3.1 — a strong signal that it's legitimate.

### When to Use It

- Binary classification problems where you need probabilities, not just labels
- When you need to explain the model's reasoning (each weight has a clear meaning)
- As a baseline for any classification task — it's fast, stable, and hard to beat for a first attempt
- When the decision boundary is roughly linear

---

## 3. K-Nearest Neighbours (KNN)

### The Idea

Almost no machinery at all, and it's surprisingly hard to beat on small problems. The intuition is the oldest one in the book: to guess something about a new example, look at the examples most similar to it and copy their answer.

To predict whether a new fruit is an apple or an orange, find the few fruits in your records that most resemble it and go with the majority.

### Visual Intuition

```
    k-Nearest Neighbours — Finding the k Closest Points
    ─────────────────────────────────────────────────────

         Feature 2
            │
            │  ○              ○ = Class A (Apple)
            │    ○  ○         ● = Class B (Orange)
            │  ○    ○         ? = New point to classify
            │    ○  ○
            │        ○     ●  ●
    ?       │  · · · · · · ●  ●       ← k=5 circle
    ★       │  ·       ·   ●  ●
            │  ·   ★   ·     ●
            │  · · · · ·
            │      ○       ●
            │    ○     ●
            │  ○
            └──────────────────────────── Feature 1


    What happens with different k?
    ───────────────────────────────

    k = 1 (overfitting)          k = 7 (smoother)
    ┌─────────────────┐          ┌─────────────────┐
    │  A A A│B B B B  │          │  A A A│B B B B  │
    │  A A A│B B B B  │          │  A A A│B B B B  │
    │  A A A│█ B B B  │          │  A A A│ B B B   │
    │  A A │█ B B B B │          │  A A A│B B B B  │
    │  A A A│B B B B  │          │  A A A│B B B B  │
    └─────────────────┘          └─────────────────┘
      Jagged, noisy boundary       Smooth, stable boundary
      Follows every outlier        Captures general trend
```

### How It Works

There's no training phase. The algorithm just memorizes the dataset and does all its work at prediction time:

1. Pick a number `k` (like 5)
2. For a new point, find its `k` closest training examples (by straight-line distance in feature space)
3. Take a vote: whichever class is most common among those `k` neighbours is the prediction
4. For regression, average their values instead of voting

This is why it's called **non-parametric** — it doesn't summarize the data into a fixed set of parameters. It keeps the data itself.

### The k Knob

This controls a familiar tension:

- **k too small** (like k=1): The model is jumpy and sensitive to noise. A single oddball neighbour can flip the answer. The boundary overfits, drawing a wild, overly detailed shape.
- **k too large**: Everything gets smoothed out. Real local structure gets washed away. The model underfits.
- **Sweet spot**: Somewhere in between, usually found by cross-validation.

### Example: Movie Recommendations

Netflix wants to predict what you'll rate a movie. They look at your 5 most similar users (by viewing history) and average their ratings for that movie.

If you're similar to 5 people who all rated "Inception" 9/10, the prediction for you is 9/10. If 3 gave it 9 and 2 gave it 7, the average is 8.2.

The "distance" here might be computed from viewing habits: which genres you watch, what time of day, how long you watch, etc. Two users are "close" if they tend to watch and enjoy similar things.

### When to Use It

- Small, low-dimensional datasets (KNN scales poorly — every prediction requires measuring distance to the entire training set)
- When the decision boundary is irregular and you don't want to assume a shape
- As a sanity check — if KNN doesn't work, maybe the features aren't predictive at all
- For recommendation systems (with appropriate distance metrics)

---

## 4. Support Vector Machines (SVM)

### The Idea

Among linear classifiers, SVM asks a sharper question. Many straight lines might separate two classes, so which one is best?

SVM's answer: pick the boundary that leaves the widest possible empty margin between the two classes. The line that stays as far as it can from the nearest points on either side. Intuitively, a boundary that barely squeaks past your data is fragile, while one with a wide buffer zone generalizes better.

### Visual Intuition

```
    Maximum Margin Classifier
    ─────────────────────────

         Feature 2
            │
            │    ○ ○                      ○ = Class -1
            │  ○ ○ ○                      ● = Class +1
            │    ○ ○                      ◎ = Support vectors
            │      ○ ○
            │───────────── ◎ ─────────── ← support vector
            │        ◎ ─ ─ ─ ─ ─ ─ ─ ─ ─ ← margin boundary
            │       ╱ DECISION BOUNDARY ╲
            │      ╱      (solid)        ╲
            │─────╱───────────────────────╲── ← margin boundary
            │    ◎                         ◎ = support vector
            │  ● ● ●
            │    ● ● ●
            │  ● ● ●
            │
            └──────────────────────────── Feature 1

    Key insight: ONLY the support vectors (◎) matter.
    Moving any other point doesn't change the boundary.


    The Kernel Trick — Lifting to Higher Dimensions
    ───────────────────────────────────────────────

    2D (not separable)              3D (separable!)
    ─────────────────              ──────────────────

       ○ ○ ○ ○ ○                      ○ ○
       ○ ● ● ● ○          lift        ○ ○
       ○ ● ● ● ○        ─────→         ● ●
       ○ ● ● ● ○                      ● ● ●
       ○ ○ ○ ○ ○                        ● ●

    Can't draw a line              But now a plane separates them!
    that separates these.
```

### The Math

The points that sit right on the edge of that buffer — the ones closest to the boundary — are the **support vectors**. They alone determine where the boundary goes. Everything else could move freely without changing it.

For separable data, the optimization is:

```
minimize: (1/2)||w||²
subject to: yᵢ(wᵀxᵢ + b) ≥ 1 for all i
```

Decoding it:
- `w` and `b` define the boundary as before
- `||w||²` is the squared length of the weight vector
- The margin width is inversely related to `||w||`, so making `||w||` small is the same as making the margin wide
- The constraint says every training point must land on the correct side of the boundary and at least a full margin away from it

### The Kernel Trick

Real data is rarely separable by a straight line, and here SVM has its most elegant move. Instead of drawing a curved boundary directly, it implicitly lifts the data into a higher-dimensional space where a straight boundary *can* separate it.

Remarkably, it does this without ever computing the new high-dimensional coordinates — by working only with similarity scores between points. Common choices:
- **Polynomial kernel**: similarity grows with polynomial functions of the features
- **RBF (radial basis function) kernel**: similarity falls off with distance, creating smooth, localized decision regions

### Example: Medical Diagnosis

You have patient data with 20 features (blood pressure, cholesterol, age, BMI, etc.) and want to classify patients as low or high risk for heart disease.

SVM finds the maximum-margin boundary in this 20-dimensional space. The support vectors are the patients closest to the decision line — the borderline cases that most clearly define the separation between low and high risk.

If the boundary isn't linear (maybe risk depends on interactions between features), the RBF kernel lifts the data into a higher dimension where a linear separator exists, capturing complex patterns without explicitly computing them.

### When to Use It

- Small-to-medium datasets with clean class boundaries
- When you want a principled way to control overfitting (the margin is a built-in regularizer)
- When the decision boundary is complex but you don't want to use a neural network
- For text classification, bioinformatics, and image classification (before deep learning took over)

---

## 5. Naive Bayes

### The Idea

This classifier comes straight from probability theory, and its charm is that a wildly unrealistic assumption produces a model that works anyway — especially for text.

To decide which class an example belongs to, ask which class makes the observed features most probable, weighted by how common each class is to begin with.

### Visual Intuition

```
    Bayes' Theorem — Flipping the Condition
    ────────────────────────────────────────

    What we want:              What we can count:
    P(spam | "free")           P("free" | spam)

    Bayes connects them:
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    │   P(spam | "free") = P("free"|spam) × P(spam)  │
    │                         ─────────────────────    │
    │                               P("free")         │
    │                                                 │
    └─────────────────────────────────────────────────┘


    Naive Bayes Classifier — Word by Word
    ──────────────────────────────────────

    Email: "Free money meeting"

                    Spam?              Not Spam?
                    ──────             ─────────
    Prior:          0.40               0.60
    × P("free"):    0.80               0.10
    × P("money"):   0.60               0.15
    × P("meeting"): 0.20               0.30
                    ────               ──────
    Product:        0.0384             0.0027
    Normalized:     93.4%              6.6%

    → Classified as SPAM

    Each word independently contributes to the score.
    "free" and "money" strongly push toward spam.
```

### The Math

It rests on Bayes' theorem, which lets you flip a conditional probability around:

```
P(y | x₁, ..., xₙ) ∝ P(y) × ∏ᵢ P(xᵢ | y)
```

Reading it:
- `P(y | x₁, ..., xₙ)` is what we want: the probability of class y given all observed features
- `∝` means "proportional to" (we drop a constant that's the same for every class)
- `P(y)` is the **prior** — how common class y is overall
- The product runs over all features, multiplying together `P(xᵢ | y)` — the probability of seeing feature value `xᵢ` within class y

To classify, compute this quantity for every class and pick the largest.

### The "Naive" Assumption

The assumption hiding in that product: it treats every feature as independent of every other, given the class. In a spam filter, this means assuming the word "free" and the word "money" appear independently of each other in spam — which is plainly false.

Yet the model works well in practice because for picking the *winning* class, you often don't need the probabilities exactly right, just ranked right.

### Example: Sentiment Analysis

You have 5,000 movie reviews labeled positive or negative. You want to classify a new review.

First, count how often each word appears in positive vs. negative reviews:
- "amazing" appears in 800 positive reviews and 20 negative reviews
- "boring" appears in 50 positive reviews and 750 negative reviews
- "the" appears in 4,900 positive and 4,900 negative (not useful)

For a new review containing "amazing" and "boring":

```
P(positive | "amazing", "boring") ∝ P(positive) × P("amazing"|positive) × P("boring"|positive)
P(negative | "amazing", "boring") ∝ P(negative) × P("amazing"|negative) × P("boring"|negative)
```

The positive class wins because "amazing" is strongly positive and "boring" isn't strong enough to overcome it (it's rare in positive reviews but "amazing" is very common there).

### When to Use It

- Text classification (spam filtering, sentiment analysis, topic classification)
- When you need a fast baseline that's easy to implement and interpret
- When training data is limited (Naive Bayes works well with small datasets)
- When features are naturally independent (or when the ranking of classes is more important than exact probabilities)

---

## 6. Decision Trees

### The Idea

The most human-readable model in machine learning. It makes decisions the way a person playing twenty questions would: by asking a sequence of yes/no questions about the features until it's confident enough to answer.

"Is income above 50k? If yes, is debt below 10k? If yes, approve." You can literally read the logic off the tree.

### Visual Intuition

```
    Decision Tree Structure
    ───────────────────────

                    ┌─────────────────┐
                    │  Income > $50K? │
                    └────────┬────────┘
                     Yes ╱       ╲ No
                        ╱         ╲
              ┌────────┴──┐    ┌───┴─────────┐
              │ Debt < $10K│    │ Approved?   │
              └─────┬──────┘    │    No       │
              Yes ╱  ╲ No       └─────────────┘
                 ╱    ╲
        ┌───────┴─┐  ┌─┴─────────┐
        │ APPROVED│  │  REVIEW   │
        │  Yes    │  │  Manual   │
        └─────────┘  └───────────┘

    Each node = a question about a feature
    Each branch = an answer (yes/no)
    Each leaf = a prediction


    How Splits Are Chosen (Gini Impurity)
    ──────────────────────────────────────

    Before split:              After split (good):
    ┌───────────────┐         ┌─────────┬─────────┐
    │ ● ● ● ○ ○ ○  │         │ ● ● ●  │  ○ ○ ○  │
    │ Gini = 0.50   │   →     │ Gini=0  │ Gini=0  │
    │ (mixed)       │         │ (pure)  │ (pure)  │
    └───────────────┘         └─────────┴─────────┘

    The tree picks splits that make child groups as pure as possible.
```

### How It's Built

Each internal node tests one feature against a threshold. Each branch is an answer to that test. Each leaf at the bottom hands back a prediction (a class for classification, a number for regression).

The tree is built greedily, top down: at every node it scans possible feature-and-threshold splits and picks the one that best separates the data, measured by a **purity criterion**:

- **Gini impurity**: scores how mixed the classes are in a group (near zero when almost all one class, larger when it's an even jumble)
- **Entropy**: similar measure from information theory

The tree prefers the split that leaves its two child groups as pure as possible.

### The Overfitting Problem

A single tree, allowed to grow deep, will keep asking ever more specific questions until it carves out a tiny region around each individual training point — memorizing noise instead of learning the pattern.

You can prune it back, but the more powerful fix is to stop relying on one tree and combine many of them.

### Example: Customer Churn Prediction

A telecom company wants to predict which customers will cancel their subscription. The decision tree might look like:

```
Contract type?
├── Month-to-month
│   ├── Tenure < 6 months?
│   │   ├── Yes → High churn risk
│   │   └── No → Monthly charges > $70?
│   │       ├── Yes → Medium churn risk
│   │       └── No → Low churn risk
│   └── Tenure > 24 months?
│       └── Yes → Low churn risk
├── One year
│   └── Support calls > 3?
│       ├── Yes → Medium churn risk
│       └── No → Low churn risk
└── Two year
    └── Low churn risk
```

You can show this to a business stakeholder and they immediately understand it. Try doing that with a neural network.

### When to Use It

- When interpretability is critical (regulatory requirements, stakeholder buy-in)
- For mixed feature types (handles numerical and categorical without preprocessing)
- As a building block for ensembles (random forests, gradient boosting)
- When you need a model that requires minimal data preparation

---

## 7. Random Forests

### The Idea

If one deep tree overfits because it's too sensitive to the exact training data, train many trees on slightly different views of the data and average them, so their individual quirks cancel out.

### Visual Intuition

```
    Random Forest — Many Trees Vote
    ────────────────────────────────

    Training Data
         │
         ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
    │Bootstrap│  │Bootstrap│  │Bootstrap│  │Bootstrap│
    │Sample 1 │  │Sample 2 │  │Sample 3 │  │Sample N │
    └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
         │            │            │            │
         ▼            ▼            ▼            ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
    │  Tree 1 │  │  Tree 2 │  │  Tree 3 │  │  Tree N │
    │ (random │  │ (random │  │ (random │  │ (random │
    │ features)│  │ features)│  │ features)│  │ features)│
    └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
         │            │            │            │
         ▼            ▼            ▼            ▼
      Class A      Class B      Class A      Class A
         │            │            │            │
         └────────────┴─────┬──────┴────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  MAJORITY   │
                     │   VOTE:     │
                     │  Class A    │
                     └─────────────┘

    Each tree sees different data + different feature subsets
    → Trees are diverse → Errors cancel out → Stable prediction
```

### How It Works

**Bagging** (bootstrap aggregating):
1. From your training set of N examples, draw a random sample of N examples *with replacement* (same example can be picked more than once)
2. Train a tree on it
3. Repeat many times
4. To predict, average their outputs (regression) or take majority vote (classification)

**The Random Forest twist**: at each split, instead of letting a tree consider all features, consider only a random subset.

This sounds like sabotage, but it has a purpose. If one feature is very predictive, every tree in plain bagging would split on it first and the trees would all look alike. Forcing each split to choose from a random feature subset decorrelates the trees, making their mistakes more independent and the averaging more effective.

### Example: Credit Scoring

A bank trains a random forest with 500 trees to predict loan default. Each tree is trained on a bootstrap sample of the data, and at each split considers only √(total features) randomly chosen features.

Some trees might split on income first, others on credit score, others on debt-to-income ratio. When they vote together, the ensemble is much more stable than any single tree. A customer who's borderline on income might be clearly above the threshold on credit score — the forest captures both perspectives.

### When to Use It

- As a solid, low-effort baseline for tabular data
- When you want good accuracy without heavy tuning
- When you need feature importance rankings (average across all trees)
- When a single decision tree isn't accurate enough but you still want some interpretability

---

## 8. Gradient Boosting

### The Idea

Bagging builds many models in parallel and averages them. Boosting takes the opposite approach: build models one after another, in sequence, with each new model focused on fixing the mistakes the ones before it made.

Where bagging fights **variance** (overfitting), boosting attacks **bias** (underfitting) by relentlessly patching what the current ensemble still gets wrong.

### Visual Intuition

```
    Boosting — Sequential Error Correction
    ───────────────────────────────────────

    Round 1:  First weak model
              ─────────────────
              Actual:    ● ● ● ● ● ● ● ● ● ●
              Predicted: ▬ ▬ ▬ ▬ ▬ ▬ ▬ ▬ ▬ ▬   (flat line, underfits)
              Residuals: ↑ ↑ ↑ ↑   ↓ ↓ ↓ ↓ ↑   (errors to fix)

    Round 2:  New model fits the residuals
              ───────────────────────────
              Actual:    ↑ ↑ ↑ ↑   ↓ ↓ ↓ ↓ ↑   (the errors from round 1)
              Predicted: ╱ ╱ ╱ ╱   ╲ ╲ ╲ ╲ ╱   (captures the pattern)
              Residuals: · · · ·   · · · · ·   (much smaller now)

    Round 3:  Another model fits remaining residuals
              ─────────────────────────────────────
              Actual:    · · · ·   · · · · ·   (tiny errors left)
              Predicted: ≈ ≈ ≈ ≈   ≈ ≈ ≈ ≈ ≈   (nearly zero)
              Residuals: · · · ·   · · · · ·   (almost gone)

    Final prediction = weighted sum of all rounds


    Bagging vs Boosting — Key Difference
    ─────────────────────────────────────

    Bagging (Random Forest):         Boosting (Gradient Boosting):
    ┌──────────────────────┐         ┌──────────────────────┐
    │  Model 1 ──┐         │         │  Model 1             │
    │  Model 2 ──┤         │         │     ↓                │
    │  Model 3 ──┼──► Vote │         │  Model 2             │
    │  Model N ──┘         │         │     ↓                │
    │  (parallel)          │         │  Model 3 ──► Final   │
    └──────────────────────┘         │  (sequential)        │
                                     └──────────────────────┘
    Reduces VARIANCE                  Reduces BIAS
```

### How It Works

1. Train a first weak model (usually a shallow tree)
2. See where it errs
3. Train a second model that pays special attention to those errors
4. Add it to the ensemble
5. See where the combined pair still errs
6. Train a third on those leftover mistakes
7. Repeat

The final prediction is a weighted combination of all models. Because each round targets the current residual errors, boosting steadily reduces bias in a way that averaging never could.

### The Libraries That Matter

In practice, the dominant form is gradient boosting over decision trees, and the libraries that implement it — **XGBoost**, **LightGBM**, and **CatBoost** — are devastatingly effective on tabular data. They've won an enormous share of competitions and are the default production choice at countless companies.

**Practical takeaway**: if you're working with structured, tabular data and aren't sure what to try first, start with gradient boosting.

### Example: Click-Through Rate Prediction

An ad platform wants to predict whether a user will click on an ad. They have millions of training examples with features like user demographics, ad content, time of day, device type, browsing history.

Round 1: A shallow tree predicts the baseline click rate. It gets most cases roughly right but misses users who click on gaming ads late at night.

Round 2: A new tree focuses on those missed cases. It learns that gaming enthusiasts on mobile devices between 10 PM and 2 AM have much higher click rates.

Round 3: The ensemble still misses cases where ad creative matters. A third tree learns that video ads outperform static images for this demographic.

After 500 rounds, the ensemble has captured intricate patterns that no single model could find.

### When to Use It

- Tabular/structured data where you want maximum accuracy
- When you have enough data to support sequential training (unlike bagging, it can't be parallelized)
- For ranking problems (learning-to-rank, search results)
- Kaggle competitions on tabular data (this is almost always the winning approach)

---

## 9. K-Means Clustering

### The Idea

We leave labeled data behind. K-means is unsupervised — nobody hands it answers, and its job is to find structure on its own.

You tell it how many clusters `k` you want, and it finds them by repeating two simple steps until things stop moving.

### Visual Intuition

```
    K-Means Iteration (k=3)
    ────────────────────────

    Iteration 0 (random init):     Iteration 1 (assign + update):
    ┌─────────────────────┐        ┌─────────────────────┐
    │ ○ ○   ● ●          │        │ ○ ○   ● ●          │
    │ ○ ○ ○ ● ● ●        │        │ ○ ○ ○ ● ● ●        │
    │ ○ ○   ● ●    ▲     │        │ ○ ○   ● ●    ▲     │
    │         ▲  ▲       │        │         ▲  ▲       │
    │     ▲            ●  │        │         ▲     ● ●  │
    │         ● ● ●      │        │             ● ● ●  │
    │         ● ● ●      │        │             ● ● ●  │
    └─────────────────────┘        └─────────────────────┘
       ▲ = centroids move to          Centroids settle into
       center of their points         natural clusters

    Iteration 2 (converged):
    ┌─────────────────────┐
    │ ○ ○   ● ●          │
    │ ○ ○ ○ ● ● ●        │
    │ ○ ○   ● ●    ▲     │
    │         ▲  ▲       │
    │             ● ● ●  │
    │             ● ● ●  │
    └─────────────────────┘
       Centroids stop moving → done!


    The Two-Step Dance
    ──────────────────

    ┌──────────────┐      ┌──────────────┐
    │  ASSIGNMENT  │ ───► │    UPDATE    │
    │              │      │              │
    │ Each point   │      │ Move each    │
    │ goes to      │      │ centroid to  │
    │ nearest      │      │ mean of its  │
    │ centroid     │      │ assigned     │
    │              │      │ points       │
    └──────────────┘      └──────┬───────┘
          ▲                      │
          │                      │
          └──────────────────────┘
            Repeat until stable
```

### The Algorithm

1. **Assignment step**: Assign every point to whichever cluster center (centroid) is nearest
2. **Update step**: Move each centroid to the average position of all the points just assigned to it
3. Repeat until convergence

What the algorithm is quietly minimizing is the total squared distance from points to their cluster's center:

```
Σᵢ Σₓ∈Cᵢ ||x - μᵢ||²
```

Where `Cᵢ` is the set of points in cluster i, and `μᵢ` is the centroid (mean) of cluster i.

### Limitations

- You have to choose `k` in advance (often unknown)
- Sensitive to where centroids start (k-means++ initialization helps)
- Struggles with stretched-out or oddly shaped clusters
- Struggles with clusters of very different sizes

### Example: Customer Segmentation

An e-commerce company has purchase data for 10,000 customers. They want to understand their customer base without predefined labels.

K-means with k=4 might reveal:
- **Cluster 1**: High-frequency, high-value buyers (loyal customers)
- **Cluster 2**: Low-frequency, high-value buyers (big occasional spenders)
- **Cluster 3**: High-frequency, low-value buyers (bargain hunters)
- **Cluster 4**: Low-frequency, low-value buyers (at-risk customers)

Each cluster gets a different marketing strategy: loyalty rewards for cluster 1, premium product recommendations for cluster 2, bulk discounts for cluster 3, re-engagement campaigns for cluster 4.

### When to Use It

- When you want to find natural groupings in unlabeled data
- For customer segmentation, document clustering, image color quantization
- When clusters are roughly spherical and similar in size
- As a preprocessing step (cluster features before feeding to a supervised model)

---

## 10. Principal Component Analysis (PCA)

### The Idea

PCA doesn't group data — it compresses it. Take data with many features and squeeze it down to a few, while throwing away as little information as possible.

The guiding intuition: the directions in which your data varies the most are the directions that carry the most information, so keep those and discard the directions where everything looks nearly the same.

### Visual Intuition

```
    PCA — Finding the Directions of Most Variance
    ──────────────────────────────────────────────

    Original 2D data (cigar-shaped cloud):

         Feature 2
            │
            │       · · ·
            │     · · · · ·
            │    · · · · · ·        PC2 (short axis)
            │     · · · · ·        ↕ captures 15% variance
            │       · · ·
            │
            └──────────────────────── Feature 1
                            ←──────→
                             PC1 (long axis)
                             captures 85% variance

    Project onto PC1 (compress 2D → 1D):

         PC1
            │
            │  ·  ·  ·  · · · · · · ·  ·  ·
            │
            └──────────────────────────────
              Most information preserved!
              Only the thin direction (noise) is lost.


    Explained Variance — How Much Info Each Component Keeps
    ──────────────────────────────────────────────────────

    Variance │ ████████████████████  40%  PC1
    captured │ ████████████          15%  PC2
             │ ███████                8%  PC3
             │ ████                   5%  PC4
             │ ██                     3%  PC5
             │ █                      2%  PC6
             └──────────────────────────────

    Rule of thumb: keep components until you've captured ~95% of total variance.
```

### How It Works

Picture a cloud of points stretched out like a cigar. There's one direction along which the cloud is long (lots of spread) and another, perpendicular to it, along which it is thin (little spread).

PCA finds the long direction first and calls it the **first principal component** — the single direction capturing the most variance. Then it finds the next direction of greatest remaining variance, at right angles to the first, and so on.

Mathematically, PCA computes the **eigenvectors** of the data's covariance matrix. The covariance matrix summarizes how the features vary together. An eigenvector is a special direction that the data spreads along cleanly, and its **eigenvalue** tells you how much variance the data has in that direction.

### Example: Gene Expression Data

A biologist measures expression levels of 20,000 genes across 100 patients. Visualizing 20,000 dimensions is impossible.

PCA reduces this to 2-3 principal components:
- PC1 (captures 40% of variance): separates patients by overall gene activity level
- PC2 (captures 15% of variance): separates by immune response genes
- PC3 (captures 8% of variance): separates by metabolic genes

Plotting patients on PC1 vs PC2, two clear clusters emerge — one group has high immune activity, the other doesn't. This might correspond to a previously unknown disease subtype.

### When to Use It

- Dimensionality reduction before visualization (project high-dimensional data to 2D/3D)
- As a preprocessing step to remove correlated features ( multicollinearity)
- When you want to compress data while preserving as much variance as possible
- For noise reduction (keep components with high variance, discard low-variance noise)

---

## Choosing the Right Algorithm

```
    Decision Flowchart — What Should I Use?
    ────────────────────────────────────────

                    Start Here
                        │
                        ▼
              ┌─────────────────┐
              │  Do you have    │
              │  labels?        │
              └────────┬────────┘
                Yes ╱       ╲ No
                   ╱         ╼
                  ▼           ▼
        ┌──────────────┐  ┌──────────────┐
        │  What are    │  │  What's your │
        │  you         │  │  goal?       │
        │  predicting? │  └──────┬───────┘
        └──────┬───────┘    ╱         ╲
          ╱         ╲      ▼           ▼
         ▼           ▼  ┌──────┐   ┌──────────┐
    ┌─────────┐  ┌────┐ │Find  │   │Compress  │
    │Category │  │Num-│ │groups│   │or        │
    │(spam,   │  │ber │ │      │   │visualize │
    │yes/no)  │  │(   │ └──┬───┘   └────┬─────┘
    └────┬────┘  │$,$)│    │            │
         │       └──┬─┘    ▼            ▼
         │          │   ┌──────┐    ┌──────┐
         │          │   │K-    │    │PCA   │
         ▼          ▼   │Means │    │t-SNE │
    ┌────────────────┐  └──────┘    └──────┘
    │ Is your data   │
    │ tabular?       │
    └───────┬────────┘
      Yes ╱     ╲ No
         ╱       ╲
        ▼         ▼
   ┌─────────┐  ┌──────────┐
   │ Gradient│  │ Neural   │
   │ Boosting│  │ Network  │
   └─────────┘  └──────────┘
```

There's no universal best, but there's a reliable rough guide:

| Situation | Try First |
|---|---|
| Tabular data, want interpretability | Linear/logistic regression, or a single shallow decision tree |
| Tabular data, want maximum accuracy | Gradient boosting (XGBoost, LightGBM, CatBoost) |
| Tabular data, want a solid low-effort baseline | Random forest |
| Small dataset with clean class boundaries | SVM |
| Text classification baseline | Naive Bayes or logistic regression |
| You just want to see what's similar to what | K-Nearest Neighbours |
| Images, audio, language, or unstructured data at scale | Neural networks |
| No labels, want to find groups | K-Means |
| No labels, want to compress or visualize | PCA for linear structure, UMAP/t-SNE for non-linear |

---

## The Bias-Variance Tradeoff — Why Ensembles Work

```
    Error
      │
      │  ╲                    ╱
      │   ╲  Total Error     ╱
      │    ╲                ╱
      │     ╲──────────────╱
      │      ╲            ╱
      │       ╲          ╱
      │        ╲________╱
      │         ╲      ╱
      │     Variance ╱ Bias
      │          ╲  ╱
      │           ╲╱  ← sweet spot
      │
      └──────────────────────────── Model Complexity
        Simple                Complex

    Simple model (linear):      Complex model (deep tree):
    High bias, low variance     Low bias, high variance
    Underfits                   Overfits

    Ensembles fix this:
    • Random Forest averages many trees → reduces variance
    • Gradient Boosting adds weak learners → reduces bias
```

### The Closing Point

Classical algorithms weren't replaced by deep learning — they were joined by it. For most tabular business data, gradient boosting still beats neural networks. Deep learning's dominance is real but concentrated in domains where learning rich representations from raw, unstructured input matters most: vision, audio, and language.

A strong practitioner knows the whole toolbox and reaches for the right tool, not the trendiest one.

---

## Quick Reference: Algorithm Complexity

| Algorithm | Training | Prediction | Memory |
|---|---|---|---|
| Linear Regression | O(n³) or O(n²) with gradient descent | O(d) | O(d) |
| Logistic Regression | O(n × d × iterations) | O(d) | O(d) |
| K-Nearest Neighbours | O(1) (just stores data) | O(n × d) | O(n × d) |
| SVM (kernel) | O(n²) to O(n³) | O(n_sv × d) | O(n_sv × d) |
| Naive Bayes | O(n × d) | O(d) | O(c × d) |
| Decision Tree | O(n × d × log n) | O(depth) | O(nodes) |
| Random Forest | O(trees × n × d × log n) | O(trees × depth) | O(trees × nodes) |
| Gradient Boosting | O(trees × n × d × depth) | O(trees × depth) | O(trees × nodes) |
| K-Means | O(n × k × d × iterations) | O(k × d) | O(k × d) |
| PCA | O(min(n²d, nd²)) | O(d × k) | O(d × k) |

Where: n = samples, d = features, k = clusters/components, t = trees, c = classes, n_sv = support vectors

---

## Glossary

- **Supervised learning**: Training with labeled examples (input-output pairs)
- **Unsupervised learning**: Training without labels (finding structure in data)
- **Overfitting**: Model learns noise in training data instead of the general pattern
- **Underfitting**: Model is too simple to capture the underlying pattern
- **Bias**: Error from model being too simple (underfitting)
- **Variance**: Error from model being too sensitive to training data (overfitting)
- **Feature**: An input variable (column in your data)
- **Label**: The output you're trying to predict
- **Hyperparameter**: A setting you choose before training (like k in KNN)
- **Decision boundary**: The surface that separates different class predictions
- **Cross-validation**: Technique for estimating how well a model generalizes
- **Ensemble**: Combining multiple models for better predictions
