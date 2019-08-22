# Scaling the analysis of song metadata

## Features

### Parsing

#### Issues

#### Improvements

### NLP

#### Custom Lexicon

##### Issues
Speed dropped from 102644.332ms to 309240.709ms, i.e. 1.7 minutes to 5.1 minutes

##### Improvements
Artists parsing improved in headers. For example, the following is a list of accuracy

```
wayne => Lil Wayne
```


#### Machine Learning
Models can be continuosly trained

### Analysis

#### Attribution Algorithm

##### Issues
Given a song with a primary artist `primary` and `s` number of sections, each with their own headers, attribution analysis currently attributes all sections to the primary artist, as well as to the collaborating artists parsed from the headers.

##### Improvements
The solutions attributes all sections to the primary, as stated above. But an improvement in the algorithm could add a clause circumventing an increment of section attributions if the header does not contain the name of the primary artist.

### Testing

The streaming parsing, and analysis pipeline can be tested using jest. 

At decreasing scales, from 5M to 2K, to 10 songs, the pipeline runs faster, allowing for developers to iterate on code without having to process the entire scale of the given stream.

#### `analyzeSample = ({RANDOM = false, SAMPLE_SIZE = 10, STREAM_SIZE = 2000} = {})`

The analysis pipeline accepts arguments for `SAMPLE_SIZE`. Given a `STREAM_SIZE`, the pipeline will be transformed to a subset of `SAMPLE_SIZE` songs. 

These songs can be `RANDOM` or, by default, the first `SAMPLE_SIZE` songs of the input stream.

## Dashboard 

### Storage
noSQL document could store a dump of the top 5 artists for a defined set of metrics to be accessed by a dashboard

### API
Node microservice could respond to requests for metrics

### Front End Microservice
Dashboard UI can be independently deployed. It would send authenticated queries to the API and render charts of the metrics

## Issues 

# Problem Statement


- Write a program to analyze a data set we’ll provide to you and print out answers to specific questions about that data

    - For this part you should submit the source code you wrote to analyze the data and any instructions that we’d need to be able to run that code ourselves to check your work.

    - You should also submit a text file called output.txt with the output of your program.


- A free‑form short (~ 1 ‑ 2 page) description of the problems you might encounter solving this problem at scale and potential solutions. You can submit this as a text file (markdown, etc), word doc, PDF, or any other readable file.

Your actual submission should be a zip (or tgz) archive with each of these files clearly labeled.

For part 1 , we’ll evaluate your code based on the following criteria, in order of importance:

- Correctness: can we run your code? Does it get the correct answer? Does it account for some edge cases in the data?

- Readability / maintainability: can we follow along with your code? Can we extend it or fix bugs if we need to?

- Performance and speed: does the code run in a reasonable amount of time?

In part 2 , we’ll evaluate you answer based on:

- How clear your answer is: is it easy to follow and understand?

- Your high level understanding of the types of issues that you might run into while scaling out this solution, and how you might approach those issues.

## Part 1 : The most lyrically prolific artist

At Genius we spend a lot of time coercing unstructured user generated content into structured data that we can use en‑masse to gain insights about music.

The first and arguably most important unstructured data that our contributors add to Genius is song lyrics data. For part 1 of this assignment you’ll comb through a sample dataset of lyrics to answer the question: **who is the most lyrically prolific artist?**

We’ve provided a sample dataset to you called songs.json. This file is a newline‑delimited JSON dump of 2,000 Genius songs, where each line corresponds to a single Genius song in JSON form and has the following fields:

```
id, lyrics_text, primary_artist, title, and url.
```

### Question 1: Primary artists with the most “lyric sections”

To help frame the problem let’s look at the (abbreviated) lyrics of Old Town Road (Remix) by Lil Nas X featuring Billy Ray Cyrus:

Notice that the lyrics are broken up into separate **lyric sections** , outlined in red in the image above
A lyrics section is a block of lyrics separated from the next block by two or more newline characters.

A rough way to measure how lyrically prolific each artist is by measuring how many total lyric sections there are in each song where they are the primary artist.

If we attribute each lyric section within a song’s lyrics to the primary artist of that song—the `primary_artist` field within that song, **which primary artists in this data set have the most total lyric sections attributed to them and how many do they have?**

**Please print out the top 5 artists and the total number of lyric sections (across all songs in the data set) associated with them.**

For example, in the "Old Town Road" example above, we would attribute the three lyric sections to Lil Nas X since he is the primary artist even though there are other performers on the song.

### Question 2 : Artists who have performed the most lyrics sections

In real life the primary artist doesn’t always perform all of the sections of a song. There may be other featured artists that perform one or more sections as well, or the artist might actually be a group of performers that perform separate parts of the song.


One thing you might have noticed in the above example lyrics is that each section has a section metadata header enclosed in square brackets, e.g. `[Intro: Billy Ray Cyrus]` above the first lyric section.

Our community of contributors often helpfully lists the performer of each section of a song in these sections, usually with a format that looks something like `[Verse 1: Lil Nas X]`, `[Chorus: Billy Ray Cyrus]`, etc.

Note that this field is **unstructured text data and not required.**

We can do a better job deciding who the most lyrically prolific artist is by attributing each lyric section to the performer of that section described in the section header. In the example above, we would attribute the first verse to Billy Ray Cyrus, the second also to Billy Ray Cyrus, and the third to Lil Nas X.

If there is no section header at all or the section header does not list a performer, e.g. simply `[Chorus]`, we’ll attribute that section to the primary artist on the song.

If multiple performers are listed, e.g. `[Chorus: YB, Big Sean & Fuzzy Jones]`, we’ll give each artist full and equal credit
for that lyrics section (as if there were 3 duplicate identical sections, one for each artist)

**Within this data set, which artists performed the most sections, and how many sections did they perform?**


**Please print out the top 5 artists and the total number of lyric sections that they performed.**

Important notes for this section:


Since this data is unstructured, there are multiple patterns that our community uses to format lyric section headers for performers. Look through the data to identify the most prominent format patterns, but don’t stress tracking down every possible edge case within the data set.

E.g. folks are supposed to write `Chorus` in section headers but sometimes people write `Hook` instead. Usually performers are listed after metadata about the section, e.g. `[Chorus: Drake]`, but other times the performer or metadata is simply listed alone, e.g. `[Drake]` or `[Chorus]` respectively. 

Sometimes multiple artists are split up as they were in the example above, via commas and ampersands. But other times artists may be delimited in other ways, e.g. `Drake + 2 Chainz`.

### Question 3 : Artists who have performed the most unique words

In the previous section we attributed individual lyrics sections to the performers of those sections. But maybe we can do even better than that: if we really want to know who the most lyrically prolific artist is we should figure out which artists have used the most unique words in their performances.

**Using the same rules as we used in Question 2 for attributing lyric sections to individual performers, which artist performed the most unique words across all songs in this data set?**

**Please print the top 5 artists and the number of
unique words that they performed.**

Important notes for this section:

As with the previous section, if multiple artists are credited on a single lyric section, you should treat it as if they each performed every word in that section. 

For the purpose of calculating unique words, capitalization and punctuation should not matter. So e.g. `Horse` should, for the purpose of calculating uniqueness, be the same as `horse` and `horse,`.

If an artist uses the word horse in song 1 and again uses it later in song 17 , that should count as 1 unique word, not two.

Insofar as there are non‑English language characters in this dataset, you may remove or ignore those characters.

You should look at the data set and think about other ways you might normalize words to get a good uniqueness count, but as with the previous section do your best but don’t worry about tracking down every last edge case.

## Part 2 : Scaling up and deploying these aggregates

The data set we provided you has 2,000 songs, but Genius’s database includes nearly 5 million songs. 

**If you were responsible for building these features at scale, such that there was a dashboard somewhere that folks could visit at any time and see the top 5 artists by each of the above metrics, what are some issues you might run into and how might you address them?**

Please write up a short response about what issues you might run into while deploying this at scale and how you might address them.

Most submissions are 1 ‑ 2 pages but feel free to write more or less.

In your description you may assume anything you want about our existing architecture, and feel free to discuss addressing scaling issues using any 3rd party service or infrastructure you would need.



